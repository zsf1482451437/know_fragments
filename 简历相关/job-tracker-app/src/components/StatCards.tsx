import { Award, Clock3, Send, Target } from "lucide-react";
import { isStatusAtOrAfter } from "@/services/jobRules";
import { useJobStore } from "@/store/useJobStore";
import type { ApplicationStatus, Job, JobTier } from "@/types/job";

interface StatCardsProps {
  jobs: Job[];
}

type StatItem =
  | {
      type: "tier";
      tier: JobTier;
      label: string;
      value: number;
      hint: string;
      icon: typeof Send;
      tone: string;
    }
  | {
      type: "status";
      status: ApplicationStatus;
      label: string;
      value: number;
      hint: string;
      icon: typeof Send;
      tone: string;
    };

export function StatCards({ jobs }: StatCardsProps) {
  const activeTier = useJobStore((state) => state.filters.tier);
  const activeStatus = useJobStore((state) => state.filters.status);
  const setFilter = useJobStore((state) => state.setFilter);
  const pendingJobs = jobs.filter((job) => job.applicationStatus === "pending_apply");

  const stats: StatItem[] = [
    {
      type: "tier",
      tier: "practice",
      label: "练手",
      value: pendingJobs.filter((job) => job.fitTier === "practice").length,
      hint: "未沟通，恢复手感",
      icon: Send,
      tone: "bg-slate-900 text-white",
    },
    {
      type: "status",
      status: "communicated",
      label: "进行中",
      value: jobs.filter((job) => isStatusAtOrAfter(job.applicationStatus, "communicated")).length,
      hint: "已沟通及之后",
      icon: Clock3,
      tone: "bg-indigo-500 text-white",
    },
    {
      type: "tier",
      tier: "fit",
      label: "适合",
      value: pendingJobs.filter((job) => job.fitTier === "fit").length,
      hint: "未沟通，认真投递",
      icon: Target,
      tone: "bg-teal-500 text-white",
    },
    {
      type: "tier",
      tier: "target",
      label: "想去",
      value: pendingJobs.filter((job) => job.fitTier === "target").length,
      hint: "未沟通，重点准备",
      icon: Award,
      tone: "bg-amber-500 text-white",
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.type === "tier"
            ? activeTier === item.tier && activeStatus === "pending_apply"
            : activeTier === "all" && activeStatus === item.status;

        return (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              if (item.type === "tier") {
                setFilter("status", "pending_apply");
                setFilter("tier", item.tier);
                return;
              }

              setFilter("tier", "all");
              setFilter("status", item.status);
            }}
            className={`rounded-3xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
              isActive ? "border-slate-950 ring-4 ring-slate-200" : "border-slate-200"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{item.label}</p>
                <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{item.value}</p>
              </div>
              <div className={`rounded-2xl p-3 ${item.tone}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-xs font-medium text-slate-400">{item.hint}</p>
          </button>
        );
      })}
    </section>
  );
}
