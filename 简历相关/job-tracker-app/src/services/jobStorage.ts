import { sampleDatabase } from "@/data/sampleJobs";
import { normalizeJob } from "@/services/jobRules";
import type { Job, JobDatabase } from "@/types/job";

const STORAGE_KEY = "boss-job-tracker-db";
const JOBS_API_BASE = import.meta.env.VITE_JOBS_API_BASE ?? "http://localhost:5175";

function isJobDatabase(value: unknown): value is JobDatabase {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<JobDatabase>;
  return (
    typeof candidate.version === "number" &&
    typeof candidate.currentSalaryK === "number" &&
    typeof candidate.updatedAt === "string" &&
    Array.isArray(candidate.jobs)
  );
}

export function loadDatabase(): JobDatabase {
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return sampleDatabase;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return isJobDatabase(parsed) ? mergeMissingSampleJobs(parsed) : sampleDatabase;
  } catch {
    return sampleDatabase;
  }
}

function mergeMissingSampleJobs(database: JobDatabase): JobDatabase {
  const normalizedDatabase = normalizeDatabase(database);
  const existingIndexes = new Set(database.jobs.map((job) => job.sourceIndex).filter(Boolean));
  const missingJobs = sampleDatabase.jobs.filter((job) => !existingIndexes.has(job.sourceIndex));
  const sampleJobsByIndex = new Map(
    sampleDatabase.jobs
      .filter((job) => typeof job.sourceIndex === "number")
      .map((job) => [job.sourceIndex, job]),
  );
  const shouldSyncSampleRawText = database.version < sampleDatabase.version;

  if (missingJobs.length === 0 && database.version >= sampleDatabase.version) {
    return normalizedDatabase;
  }

  const existingJobs = normalizedDatabase.jobs.map((job) => {
    const sampleJob = sampleJobsByIndex.get(job.sourceIndex);
    if (!shouldSyncSampleRawText || !sampleJob) return job;

    return {
      ...job,
      jdRaw: sampleJob.jdRaw,
      updatedAt: new Date().toISOString(),
    };
  });

  const nextDatabase: JobDatabase = {
    ...database,
    version: sampleDatabase.version,
    currentSalaryK: database.currentSalaryK || sampleDatabase.currentSalaryK,
    updatedAt: new Date().toISOString(),
    jobs: [...existingJobs, ...missingJobs].sort((a, b) => (a.sourceIndex ?? 0) - (b.sourceIndex ?? 0)),
  };

  saveDatabase(nextDatabase);
  return nextDatabase;
}

function normalizeDatabase(database: JobDatabase): JobDatabase {
  return {
    ...database,
    jobs: database.jobs.map((job) => normalizeJob(job)),
  };
}

export function saveDatabase(database: JobDatabase): void {
  const nextDatabase = {
    ...database,
    updatedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDatabase, null, 2));
  void syncJobsFile(nextDatabase);
}

async function syncJobsFile(database: JobDatabase): Promise<void> {
  try {
    await fetch(`${JOBS_API_BASE}/api/jobs`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(database),
    });
  } catch {
    // The local Node API is optional in development. localStorage remains the fallback.
  }
}

export function resetDatabase(): JobDatabase {
  saveDatabase(sampleDatabase);
  return sampleDatabase;
}

export function exportDatabase(database: JobDatabase): void {
  const blob = new Blob([JSON.stringify(database, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `jobs-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function importDatabase(file: File): Promise<JobDatabase> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as unknown;
        if (!isJobDatabase(parsed)) {
          reject(new Error("JSON 结构不符合 JobDatabase 格式"));
          return;
        }

        const normalized: JobDatabase = normalizeDatabase({
          ...parsed,
          updatedAt: new Date().toISOString(),
          jobs: parsed.jobs.map((job: Job) => ({
            ...job,
            updatedAt: job.updatedAt ?? new Date().toISOString(),
            createdAt: job.createdAt ?? new Date().toISOString(),
          })),
        });

        saveDatabase(normalized);
        resolve(normalized);
      } catch (error) {
        reject(error instanceof Error ? error : new Error("JSON 解析失败"));
      }
    };

    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsText(file);
  });
}
