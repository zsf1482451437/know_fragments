import { ExternalLink, Trash2 } from "lucide-react";
import {
  applicationStatusLabel,
  companyStageLabel,
  getStatusRank,
  jobTierLabel,
  scoreToText,
  statusOptions,
  tierOptions,
} from "@/services/jobRules";
import { useJobStore } from "@/store/useJobStore";
import type { ApplicationStatus, Job, JobTier } from "@/types/job";

interface JobTableProps {
  jobs: Job[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export function JobTable({
  jobs,
  totalCount,
  currentPage,
  pageSize,
  totalPages,
  onPrevPage,
  onNextPage,
}: JobTableProps) {
  const selectJob = useJobStore((state) => state.selectJob);
  const updateStatus = useJobStore((state) => state.updateStatus);
  const updateJob = useJobStore((state) => state.updateJob);
  const deleteJob = useJobStore((state) => state.deleteJob);

  if (jobs.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <p className="text-sm font-bold text-slate-500">当前显示</p>
          <p className="text-sm font-black text-slate-950">共 0 条岗位</p>
        </div>
        <div className="py-8 text-center">
          <p className="text-lg font-black text-slate-900">没有匹配岗位</p>
          <p className="mt-2 text-sm text-slate-500">调整筛选条件，或新增一条岗位记录。</p>
        </div>
      </section>
    );
  }

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <p className="text-sm font-bold text-slate-500">当前显示</p>
        <p className="text-sm font-black text-slate-950">
          {startIndex}-{endIndex} / 共 {totalCount} 条岗位
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[1280px] w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-4">公司 / 岗位</th>
              <th className="px-4 py-4">薪资</th>
              <th className="px-4 py-4">阶段</th>
              <th className="px-4 py-4">推荐档位</th>
              <th className="px-4 py-4">匹配</th>
              <th className="px-4 py-4">进度节点</th>
              <th className="px-4 py-4">风险/理由</th>
              <th className="px-4 py-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {jobs.map((job) => (
              <tr key={job.id} className="align-top transition hover:bg-slate-50/70">
                <td className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() => selectJob(job.id)}
                    className="text-left"
                  >
                    <p className="font-black text-slate-950 hover:text-teal-700">{job.companyName}</p>
                    <p className="mt-1 text-xs text-slate-500">{job.jobTitle || "前端开发工程师"}</p>
                    <p className="mt-2 text-xs text-slate-400">#{job.sourceIndex ?? "-"}</p>
                  </button>
                </td>
                <td className="px-4 py-4 font-bold text-slate-900">{job.salaryText}</td>
                <td className="px-4 py-4 text-slate-600">{companyStageLabel[job.companyStage]}</td>
                <td className="px-4 py-4">
                  <select
                    value={job.fitTier}
                    onChange={(event) => updateJob(job.id, { fitTier: event.target.value as JobTier })}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-50"
                  >
                    {tierOptions.map((tier) => (
                      <option key={tier} value={tier}>
                        {jobTierLabel[tier]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-4">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-teal-500"
                      style={{ width: `${job.matchScore ?? 0}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs font-bold text-slate-600">{scoreToText(job.matchScore)}</p>
                </td>
                <td className="px-4 py-4">
                  <ProgressNodes
                    value={job.applicationStatus}
                    onChange={(status) => updateStatus(job.id, status)}
                  />
                </td>
                <td className="max-w-[280px] px-4 py-4">
                  <p className="line-clamp-2 text-xs leading-5 text-slate-600">{job.fitReason}</p>
                  {job.riskReason ? (
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-rose-500">{job.riskReason}</p>
                  ) : null}
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => selectJob(job.id)}
                      className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                      aria-label="查看岗位详情"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteJob(job.id)}
                      className="rounded-xl border border-slate-200 p-2 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                      aria-label="删除岗位"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-slate-500">
          每页 {pageSize} 条，第 {currentPage} / {totalPages} 页
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPrevPage}
            disabled={currentPage <= 1}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            上一页
          </button>
          <button
            type="button"
            onClick={onNextPage}
            disabled={currentPage >= totalPages}
            className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            下一页
          </button>
        </div>
      </footer>
    </section>
  );
}

interface ProgressNodesProps {
  value: ApplicationStatus;
  onChange: (status: ApplicationStatus) => void;
}

function ProgressNodes({ value, onChange }: ProgressNodesProps) {
  const currentRank = getStatusRank(value);

  return (
    <div className="min-w-[420px]">
      <div className="flex items-start">
        {statusOptions.map((status, index) => {
          const rank = getStatusRank(status);
          const isCurrent = status === value;
          const isReached = rank <= currentRank;
          const isTerminalRejected = status === "rejected" && isReached;
          const isLast = index === statusOptions.length - 1;

          return (
            <div key={status} className="flex flex-1 items-start last:flex-none">
              <button
                type="button"
                onClick={() => onChange(status)}
                title={applicationStatusLabel[status]}
                aria-label={`切换到${applicationStatusLabel[status]}`}
                className="group flex min-w-[46px] flex-col items-center gap-1 outline-none"
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 text-[10px] font-black transition ${
                    isCurrent
                      ? "border-slate-950 bg-slate-950 text-white ring-4 ring-slate-200"
                      : isReached
                        ? isTerminalRejected
                          ? "border-rose-500 bg-rose-500 text-white"
                          : "border-teal-500 bg-teal-500 text-white"
                        : "border-slate-200 bg-white text-slate-300 group-hover:border-teal-300"
                  }`}
                >
                  {index + 1}
                </span>
                <span
                  className={`max-w-[56px] text-center text-[10px] font-bold leading-3 ${
                    isCurrent ? "text-slate-950" : isReached ? "text-slate-600" : "text-slate-400"
                  }`}
                >
                  {applicationStatusLabel[status]}
                </span>
              </button>
              {!isLast ? (
                <div
                  className={`mt-2.5 h-0.5 flex-1 ${
                    rank < currentRank ? "bg-teal-400" : "bg-slate-200"
                  }`}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
