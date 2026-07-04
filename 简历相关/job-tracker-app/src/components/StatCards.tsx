import { Award, Send, Target } from "lucide-react";
import { useJobStore } from "@/store/useJobStore";
import type { Job, JobTier } from "@/types/job";

interface StatCardsProps {
  jobs: Job[];
}

export function StatCards({ jobs }: StatCardsProps) {
  const activeTier = useJobStore((state) => state.filters.tier);
  const setFilter = useJobStore((state) => state.setFilter);

  const stats = [
    {
      tier: "practice",
      label: "练手",
      value: jobs.filter((job) => job.fitTier === "practice").length,
      hint: "恢复手感",
      icon: Send,
      tone: "bg-slate-900 text-white",
    },
    {
      tier: "fit",
      label: "适合",
      value: jobs.filter((job) => job.fitTier === "fit").length,
      hint: "认真投递",
      icon: Target,
      tone: "bg-teal-500 text-white",
    },
    {
      tier: "target",
      label: "想去",
      value: jobs.filter((job) => job.fitTier === "target").length,
      hint: "重点准备",
      icon: Award,
      tone: "bg-amber-500 text-white",
    },
  ] satisfies Array<{
    tier: JobTier;
    label: string;
    value: number;
    hint: string;
    icon: typeof Send;
    tone: string;
  }>;

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {stats.map((item) => {
        const Icon = item.icon;
        const isActive = activeTier === item.tier;

        return (
          <button
            key={item.label}
            type="button"
            onClick={() => setFilter("tier", item.tier)}
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
