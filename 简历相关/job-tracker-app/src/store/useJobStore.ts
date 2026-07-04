import { create } from "zustand";
import {
  exportDatabase,
  importDatabase,
  loadDatabase,
  resetDatabase,
  saveDatabase,
} from "@/services/jobStorage";
import { createEmptyJob, getStageTier, normalizeJob } from "@/services/jobRules";
import type { ApplicationStatus, Job, JobDatabase, JobFilters, UserIntent } from "@/types/job";

interface JobStore {
  database: JobDatabase;
  filters: JobFilters;
  selectedJobId: string | null;
  importError: string | null;
  setFilter: <K extends keyof JobFilters>(key: K, value: JobFilters[K]) => void;
  clearFilters: () => void;
  selectJob: (jobId: string | null) => void;
  addJob: (patch?: Partial<Job>) => void;
  updateJob: (jobId: string, patch: Partial<Job>) => void;
  deleteJob: (jobId: string) => void;
  updateStatus: (jobId: string, status: ApplicationStatus) => void;
  updateIntent: (jobId: string, intent: UserIntent) => void;
  exportJson: () => void;
  importJson: (file: File) => Promise<void>;
  resetToSample: () => void;
}

const defaultFilters: JobFilters = {
  keyword: "",
  tier: "all",
  status: "all",
  stage: "all",
};

function persist(database: JobDatabase): JobDatabase {
  saveDatabase(database);
  return database;
}

function updateDatabase(database: JobDatabase, jobs: Job[]): JobDatabase {
  return persist({
    ...database,
    jobs,
    updatedAt: new Date().toISOString(),
  });
}

export const useJobStore = create<JobStore>((set, get) => ({
  database: loadDatabase(),
  filters: defaultFilters,
  selectedJobId: null,
  importError: null,

  setFilter: (key, value) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    }));
  },

  clearFilters: () => set({ filters: defaultFilters }),

  selectJob: (jobId) => set({ selectedJobId: jobId }),

  addJob: (patch) => {
    const baseJob = {
      ...createEmptyJob(),
      ...patch,
    };
    const stageTier = getStageTier(baseJob.companyStage);
    const job = normalizeJob({
      ...baseJob,
      stageTier,
      fitTier: patch?.fitTier ?? stageTier,
    });

    set((state) => ({
      database: updateDatabase(state.database, [job, ...state.database.jobs]),
      selectedJobId: null,
    }));
  },

  updateJob: (jobId, patch) => {
    set((state) => {
      const jobs = state.database.jobs.map((job) => {
        if (job.id !== jobId) return job;
        return normalizeJob({
          ...job,
          ...patch,
          updatedAt: new Date().toISOString(),
        });
      });

      return {
        database: updateDatabase(state.database, jobs),
      };
    });
  },

  deleteJob: (jobId) => {
    set((state) => ({
      database: updateDatabase(
        state.database,
        state.database.jobs.filter((job) => job.id !== jobId),
      ),
      selectedJobId: state.selectedJobId === jobId ? null : state.selectedJobId,
    }));
  },

  updateStatus: (jobId, status) => {
    get().updateJob(jobId, { applicationStatus: status });
  },

  updateIntent: (jobId, intent) => {
    get().updateJob(jobId, { userIntent: intent });
  },

  exportJson: () => {
    exportDatabase(get().database);
  },

  importJson: async (file) => {
    try {
      const database = await importDatabase(file);
      set({ database, importError: null, selectedJobId: null });
    } catch (error) {
      set({
        importError: error instanceof Error ? error.message : "导入失败",
      });
    }
  },

  resetToSample: () => {
    set({
      database: resetDatabase(),
      selectedJobId: null,
      importError: null,
      filters: defaultFilters,
    });
  },
}));
