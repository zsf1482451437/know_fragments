import { X } from "lucide-react";
import {
  applicationStatusLabel,
  companyStageLabel,
  jobTierLabel,
  stageOptions,
  statusOptions,
  tierOptions,
} from "@/services/jobRules";
import { useJobStore } from "@/store/useJobStore";
import type { ApplicationStatus, CompanyStage, Job, JobTier } from "@/types/job";

function FieldLabel({ children }: { children: string }) {
  return <label className="text-xs font-black uppercase tracking-wide text-slate-500">{children}</label>;
}

interface TextInputProps {
  value: string | number | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
}

function TextInput({ value, onChange, placeholder }: TextInputProps) {
  return (
    <input
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-50"
    />
  );
}

export function JobEditorDrawer() {
  const selectedJobId = useJobStore((state) => state.selectedJobId);
  const jobs = useJobStore((state) => state.database.jobs);
  const updateJob = useJobStore((state) => state.updateJob);
  const selectJob = useJobStore((state) => state.selectJob);
  const job = jobs.find((item) => item.id === selectedJobId);

  if (!job) return null;

  const update = (patch: Partial<Job>) => updateJob(job.id, patch);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/30 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          selectJob(null);
        }
      }}
    >
      <aside className="h-full w-full max-w-3xl overflow-y-auto bg-white shadow-2xl">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">岗位详情</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">{job.companyName || "未命名公司"}</h2>
              <p className="mt-1 text-sm text-slate-500">{job.jobTitle || "前端开发工程师"}</p>
            </div>
            <button
              type="button"
              onClick={() => selectJob(null)}
              className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="关闭详情"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="space-y-8 px-6 py-6">
          <section className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel>公司名称</FieldLabel>
              <TextInput value={job.companyName} onChange={(value) => update({ companyName: value })} />
            </div>
            <div>
              <FieldLabel>岗位名称</FieldLabel>
              <TextInput value={job.jobTitle} onChange={(value) => update({ jobTitle: value })} />
            </div>
            <div>
              <FieldLabel>薪资范围</FieldLabel>
              <TextInput value={job.salaryText} onChange={(value) => update({ salaryText: value })} />
            </div>
            <div>
              <FieldLabel>来源编号</FieldLabel>
              <TextInput
                value={job.sourceIndex}
                onChange={(value) =>
                  update({ sourceIndex: value ? Number(value) : undefined })
                }
              />
            </div>
            <div>
              <FieldLabel>融资阶段</FieldLabel>
              <select
                value={job.companyStage}
                onChange={(event) => update({ companyStage: event.target.value as CompanyStage })}
                className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-50"
              >
                {stageOptions.map((stage) => (
                  <option key={stage} value={stage}>
                    {companyStageLabel[stage]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>进度节点</FieldLabel>
              <select
                value={job.applicationStatus}
                onChange={(event) =>
                  update({ applicationStatus: event.target.value as ApplicationStatus })
                }
                className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-50"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {applicationStatusLabel[status]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>最终推荐档位</FieldLabel>
              <select
                value={job.fitTier}
                onChange={(event) => update({ fitTier: event.target.value as JobTier })}
                className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-50"
              >
                {tierOptions.map((tier) => (
                  <option key={tier} value={tier}>
                    {jobTierLabel[tier]}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <FieldLabel>JD 原文</FieldLabel>
              <pre className="mt-2 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700">
                {job.jdRaw || "暂无 JD 原文"}
              </pre>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
