import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  applicationStatusLabel,
  companyStageLabel,
  jobTierLabel,
  stageOptions,
  statusOptions,
  tierOptions,
} from "@/services/jobRules";
import { useJobStore } from "@/store/useJobStore";
import type { ApplicationStatus, CompanyStage, JobTier } from "@/types/job";

export function JobFilters() {
  const filters = useJobStore((state) => state.filters);
  const setFilter = useJobStore((state) => state.setFilter);
  const clearFilters = useJobStore((state) => state.clearFilters);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <SlidersHorizontal className="h-4 w-4 text-teal-600" />
          筛选岗位
        </div>
        <button
          type="button"
          onClick={clearFilters}
          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <X className="h-3.5 w-3.5" />
          清空
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.keyword}
            onChange={(event) => setFilter("keyword", event.target.value)}
            placeholder="搜索公司、JD、理由、备注"
            className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-50"
          />
        </label>

        <select
          value={filters.tier}
          onChange={(event) => setFilter("tier", event.target.value as JobTier | "all")}
          className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-50"
        >
          <option value="all">全部档位</option>
          {tierOptions.map((tier) => (
            <option key={tier} value={tier}>
              {jobTierLabel[tier]}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(event) => setFilter("status", event.target.value as ApplicationStatus | "all")}
          className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-50"
        >
          <option value="all">全部进度节点</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {applicationStatusLabel[status]}
            </option>
          ))}
        </select>

        <select
          value={filters.stage}
          onChange={(event) => setFilter("stage", event.target.value as CompanyStage | "all")}
          className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-50"
        >
          <option value="all">全部阶段</option>
          {stageOptions.map((stage) => (
            <option key={stage} value={stage}>
              {companyStageLabel[stage]}
            </option>
          ))}
        </select>

      </div>
    </section>
  );
}
