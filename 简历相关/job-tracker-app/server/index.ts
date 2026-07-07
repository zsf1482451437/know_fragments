import cors from "cors";
import express from "express";
import fs from "node:fs/promises";
import path from "node:path";

interface JobDatabase {
  version: number;
  currentSalaryK: number;
  updatedAt: string;
  jobs: unknown[];
}

const app = express();
const port = Number(process.env.JOB_API_PORT ?? 5175);
const jobsFilePath = path.resolve(process.cwd(), process.env.JOBS_FILE ?? "data/jobs.json");

app.use(cors({ origin: true }));
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, jobsFilePath });
});

app.get("/api/jobs", async (_req, res, next) => {
  try {
    const database = await readJobsDatabase();
    res.json(database);
  } catch (error) {
    next(error);
  }
});

app.put("/api/jobs", async (req, res, next) => {
  try {
    const database = normalizeJobsDatabase(req.body);
    await writeJobsDatabase(database);
    res.json({ ok: true, updatedAt: database.updatedAt, jobsFilePath });
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  void next;
  const message = error instanceof Error ? error.message : "Unknown server error";
  res.status(500).json({ ok: false, message });
});

app.listen(port, () => {
  console.log(`jobs api running at http://localhost:${port}`);
  console.log(`jobs json path: ${jobsFilePath}`);
});

async function readJobsDatabase(): Promise<JobDatabase> {
  await ensureJobsFile();
  const raw = await fs.readFile(jobsFilePath, "utf-8");
  return normalizeJobsDatabase(JSON.parse(raw));
}

async function writeJobsDatabase(database: JobDatabase): Promise<void> {
  await fs.mkdir(path.dirname(jobsFilePath), { recursive: true });

  const tempFilePath = `${jobsFilePath}.tmp`;
  await fs.writeFile(tempFilePath, `${JSON.stringify(database, null, 2)}\n`, "utf-8");
  await fs.rename(tempFilePath, jobsFilePath);
}

async function ensureJobsFile(): Promise<void> {
  try {
    await fs.access(jobsFilePath);
  } catch {
    await writeJobsDatabase(createEmptyDatabase());
  }
}

function normalizeJobsDatabase(value: unknown): JobDatabase {
  if (!isRecord(value)) {
    throw new Error("Invalid jobs database: root must be an object");
  }

  if (!Array.isArray(value.jobs)) {
    throw new Error("Invalid jobs database: jobs must be an array");
  }

  return {
    version: typeof value.version === "number" ? value.version : 1,
    currentSalaryK: typeof value.currentSalaryK === "number" ? value.currentSalaryK : 18,
    updatedAt: new Date().toISOString(),
    jobs: value.jobs,
  };
}

function createEmptyDatabase(): JobDatabase {
  return {
    version: 1,
    currentSalaryK: 18,
    updatedAt: new Date().toISOString(),
    jobs: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
