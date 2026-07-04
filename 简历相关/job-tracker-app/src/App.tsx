import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CreateJobModal } from "@/components/CreateJobModal";
import { DataToolbar } from "@/components/DataToolbar";
import { JobEditorDrawer } from "@/components/JobEditorDrawer";
import { JobFilters } from "@/components/JobFilters";
import { JobTable } from "@/components/JobTable";
import { StatCards } from "@/components/StatCards";
import { useJobStore } from "@/store/useJobStore";
import type { Job } from "@/types/job";

const PAGE_SIZE = 10;

export default function App() {
  const database = useJobStore((state) => state.database);
  const filters = useJobStore((state) => state.filters);
  const [createOpen, setCreateOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredJobs = useMemo(() => {
    return database.jobs
      .filter((job) => matchKeyword(job, filters.keyword))
      .filter((job) => filters.tier === "all" || job.fitTier === filters.tier)
      .filter((job) => filters.status === "all" || job.applicationStatus === filters.status)
      .filter((job) => filters.stage === "all" || job.companyStage === filters.stage)
      .sort((a, b) => {
        const priorityOrder = ["P0", "P1", "P2", "P3", "P4"];
        const aPriority = priorityOrder.indexOf(a.priority ?? "P3");
        const bPriority = priorityOrder.indexOf(b.priority ?? "P3");

        if (aPriority !== bPriority) return aPriority - bPriority;
        return (b.matchScore ?? 0) - (a.matchScore ?? 0);
      });
  }, [database.jobs, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredJobs.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, filteredJobs]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dffcf5,transparent_35%),linear-gradient(180deg,#f8fafc,#eef2f7)] text-slate-900">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-5 py-6 lg:px-8">
        <StatCards jobs={database.jobs} />
        <DataToolbar />
        <JobFilters />
        <JobTable
          jobs={paginatedJobs}
          totalCount={filteredJobs.length}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          totalPages={totalPages}
          onPrevPage={() => setCurrentPage((page) => Math.max(1, page - 1))}
          onNextPage={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
        />
      </div>
      <button
        type="button"
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white shadow-2xl shadow-slate-400/60 transition hover:-translate-y-0.5 hover:bg-teal-600"
        aria-label="新增岗位"
      >
        <Plus className="h-7 w-7" />
      </button>
      <CreateJobModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <JobEditorDrawer />
    </main>
  );
}

function matchKeyword(job: Job, keyword: string): boolean {
  const value = keyword.trim().toLowerCase();
  if (!value) return true;

  const searchText = [
    job.companyName,
    job.jobTitle,
    job.salaryText,
    job.jdRaw,
    job.fitReason,
    job.riskReason,
    job.remark,
    ...(job.techStack ?? []),
    ...(job.prepNotes ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchText.includes(value);
}
