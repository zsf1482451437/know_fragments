import { X } from "lucide-react";
import { useState } from "react";
import { companyStageLabel, stageOptions } from "@/services/jobRules";
import { useJobStore } from "@/store/useJobStore";
import type { CompanyStage } from "@/types/job";

interface CreateJobModalProps {
  open: boolean;
  onClose: () => void;
}

interface CreateJobForm {
  companyName: string;
  companyStage: CompanyStage;
  jobTitle: string;
  salaryText: string;
  jdRaw: string;
  sourceIndex: string;
}

const initialForm: CreateJobForm = {
  companyName: "",
  companyStage: "unknown",
  jobTitle: "前端开发工程师",
  salaryText: "",
  jdRaw: "",
  sourceIndex: "",
};

export function CreateJobModal({ open, onClose }: CreateJobModalProps) {
  const addJob = useJobStore((state) => state.addJob);
  const [form, setForm] = useState<CreateJobForm>(initialForm);

  if (!open) return null;

  const updateForm = <K extends keyof CreateJobForm>(key: K, value: CreateJobForm[K]) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = () => {
    if (!form.companyName.trim()) return;

    addJob({
      companyName: form.companyName.trim(),
      companyStage: form.companyStage,
      jobTitle: form.jobTitle.trim() || "前端开发工程师",
      salaryText: form.salaryText.trim(),
      jdRaw: form.jdRaw.trim(),
      sourceIndex: form.sourceIndex ? Number(form.sourceIndex) : undefined,
    });

    setForm(initialForm);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">新增岗位</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">录入基础信息</h2>
            <p className="mt-1 text-sm text-slate-500">
              新增时只录入客观字段，个人意向、匹配度、优先级和准备内容后续在详情里补。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="关闭新增岗位弹窗"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-xs font-black uppercase tracking-wide text-slate-500">
            公司名称
            <input
              value={form.companyName}
              onChange={(event) => updateForm("companyName", event.target.value)}
              placeholder="如：欢聚集团"
              className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium normal-case tracking-normal text-slate-900 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-50"
            />
          </label>

          <label className="text-xs font-black uppercase tracking-wide text-slate-500">
            岗位名称
            <input
              value={form.jobTitle}
              onChange={(event) => updateForm("jobTitle", event.target.value)}
              placeholder="如：前端开发工程师"
              className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium normal-case tracking-normal text-slate-900 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-50"
            />
          </label>

          <label className="text-xs font-black uppercase tracking-wide text-slate-500">
            融资阶段
            <select
              value={form.companyStage}
              onChange={(event) => updateForm("companyStage", event.target.value as CompanyStage)}
              className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium normal-case tracking-normal text-slate-900 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-50"
            >
              {stageOptions.map((stage) => (
                <option key={stage} value={stage}>
                  {companyStageLabel[stage]}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-black uppercase tracking-wide text-slate-500">
            薪资范围
            <input
              value={form.salaryText}
              onChange={(event) => updateForm("salaryText", event.target.value)}
              placeholder="如：20-30k"
              className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium normal-case tracking-normal text-slate-900 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-50"
            />
          </label>

          <label className="text-xs font-black uppercase tracking-wide text-slate-500">
            来源编号
            <input
              value={form.sourceIndex}
              onChange={(event) => updateForm("sourceIndex", event.target.value)}
              placeholder="可选，如：26"
              className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium normal-case tracking-normal text-slate-900 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-50"
            />
          </label>

          <label className="md:col-span-2 text-xs font-black uppercase tracking-wide text-slate-500">
            JD 原文
            <textarea
              value={form.jdRaw}
              onChange={(event) => updateForm("jdRaw", event.target.value)}
              rows={7}
              placeholder="粘贴岗位职责、任职要求、加分项..."
              className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium leading-6 normal-case tracking-normal text-slate-900 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-50"
            />
          </label>
        </div>

        <footer className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!form.companyName.trim()}
            className="rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            保存岗位
          </button>
        </footer>
      </section>
    </div>
  );
}
