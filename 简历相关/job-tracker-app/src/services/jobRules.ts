import type {
  ApplicationStatus,
  CompanyStage,
  Job,
  JobTier,
  Priority,
  SalaryLiftLevel,
  TechTag,
  UserIntent,
} from "@/types/job";

export const companyStageLabel: Record<CompanyStage, string> = {
  no_financing: "不需要融资",
  angel: "天使轮",
  series_a: "A 轮",
  series_b: "B 轮",
  series_c: "C 轮",
  series_d: "D 轮",
  listed: "上市",
  unknown: "未知",
};

export const jobTierLabel: Record<JobTier, string> = {
  practice: "适合练手",
  fit: "适合去",
  target: "想去",
};

export const userIntentLabel: Record<UserIntent, string> = {
  unset: "未标记",
  not_interested: "不感兴趣",
  normal: "一般",
  want: "个人想去",
};

export const applicationStatusLabel: Record<ApplicationStatus, string> = {
  pending_apply: "待投递",
  communicated: "已沟通",
  applied: "已投递",
  pending_interview: "待面试",
  first_interview: "一面",
  second_interview: "二面",
  rejected: "不通过",
  offer: "offer",
};

export const priorityLabel: Record<Priority, string> = {
  P0: "P0 重点",
  P1: "P1 优先",
  P2: "P2 正常",
  P3: "P3 练手",
  P4: "P4 谨慎",
};

export const techTagLabel: Record<TechTag, string> = {
  react: "React",
  vue: "Vue",
  typescript: "TypeScript",
  nextjs: "Next.js",
  nuxt: "Nuxt",
  react_native: "React Native",
  nodejs: "Node.js",
  python: "Python",
  tailwindcss: "TailwindCSS",
  webpack: "Webpack",
  vite: "Vite",
  monorepo: "Monorepo",
  turborepo: "Turborepo",
  websocket: "WebSocket",
  sse: "SSE",
  ai_agent: "AI Agent",
  ai_coding: "AI Coding",
  low_code: "低代码",
  data_visualization: "数据可视化",
  webgl: "WebGL",
  android: "Android",
  golang: "Golang",
  docker: "Docker",
  cicd: "CI/CD",
};

export const stageOptions = Object.keys(companyStageLabel) as CompanyStage[];
export const tierOptions = Object.keys(jobTierLabel) as JobTier[];
export const statusOptions = Object.keys(applicationStatusLabel) as ApplicationStatus[];
export const techTagOptions = Object.keys(techTagLabel) as TechTag[];

const statusRank: Record<ApplicationStatus, number> = statusOptions.reduce(
  (rankMap, status, index) => ({
    ...rankMap,
    [status]: index,
  }),
  {} as Record<ApplicationStatus, number>,
);

export function getStageTier(stage: CompanyStage): JobTier {
  if (stage === "no_financing" || stage === "angel" || stage === "series_a") {
    return "practice";
  }

  if (stage === "series_b" || stage === "series_c") {
    return "fit";
  }

  if (stage === "series_d" || stage === "listed") {
    return "target";
  }

  return "practice";
}

export function parseSalaryText(salaryText: string): {
  salaryMinK?: number;
  salaryMaxK?: number;
  salaryLiftLevel?: SalaryLiftLevel;
} {
  const match = salaryText.match(/(\d+)\s*-\s*(\d+)\s*k?/i);

  if (!match) {
    return {};
  }

  const salaryMinK = Number(match[1]);
  const salaryMaxK = Number(match[2]);

  return {
    salaryMinK,
    salaryMaxK,
    salaryLiftLevel: getSalaryLiftLevel(salaryMinK, salaryMaxK, 18),
  };
}

export function normalizeSalaryText(salaryText: string): string {
  const value = salaryText.trim();

  if (!value) return "";

  const singleNumberMatch = value.match(/^(\d+(?:\.\d+)?)(?:\s*k)?$/i);
  if (singleNumberMatch) {
    return `${singleNumberMatch[1]}k`;
  }

  const rangeMatch = value.match(/^(\d+(?:\.\d+)?)(?:\s*k)?\s*-\s*(\d+(?:\.\d+)?)(?:\s*k)?$/i);
  if (rangeMatch) {
    return `${rangeMatch[1]}-${rangeMatch[2]}k`;
  }

  return value;
}

export function isStatusAtOrAfter(status: ApplicationStatus, filterStatus: ApplicationStatus): boolean {
  if (filterStatus === "pending_apply") {
    return status === "pending_apply";
  }

  return statusRank[status] >= statusRank[filterStatus];
}

export function getStatusRank(status: ApplicationStatus): number {
  return statusRank[status];
}

export function getSalaryLiftLevel(
  salaryMinK: number,
  salaryMaxK: number,
  currentSalaryK: number,
): SalaryLiftLevel {
  if (salaryMaxK < currentSalaryK) return "below_current";
  if (salaryMinK <= currentSalaryK && salaryMaxK <= currentSalaryK + 2) return "same";
  if (salaryMinK <= currentSalaryK && salaryMaxK <= currentSalaryK + 8) return "small_increase";
  if (salaryMinK >= currentSalaryK + 2 || salaryMaxK >= currentSalaryK + 10) return "good_increase";
  return "high_increase";
}

export function normalizeJob(job: Job): Job {
  const salaryText = normalizeSalaryText(job.salaryText);
  const salary = parseSalaryText(salaryText);
  const stageTier = getStageTier(job.companyStage);
  const now = new Date().toISOString();

  return {
    ...job,
    salaryText,
    ...salary,
    stageTier,
    currentSalaryK: job.currentSalaryK ?? 18,
    updatedAt: now,
  };
}

export function createEmptyJob(): Job {
  const now = new Date().toISOString();

  return {
    id: `job-${Date.now()}`,
    companyName: "",
    companyStage: "unknown",
    jobTitle: "前端开发工程师",
    salaryText: "",
    currentSalaryK: 18,
    jdRaw: "",
    techStack: [],
    businessTags: [],
    riskTags: [],
    stageTier: "practice",
    fitTier: "practice",
    userIntent: "unset",
    applicationStatus: "pending_apply",
    greetingStatus: "not_generated",
    createdAt: now,
    updatedAt: now,
  };
}

export function getTierClasses(tier: JobTier): string {
  const classes: Record<JobTier, string> = {
    practice: "bg-slate-100 text-slate-700 ring-slate-200",
    fit: "bg-teal-50 text-teal-700 ring-teal-200",
    target: "bg-amber-50 text-amber-700 ring-amber-200",
  };

  return classes[tier];
}

export function getStatusClasses(status: ApplicationStatus): string {
  const classes: Record<ApplicationStatus, string> = {
    pending_apply: "bg-slate-100 text-slate-700",
    communicated: "bg-indigo-50 text-indigo-700",
    applied: "bg-blue-50 text-blue-700",
    pending_interview: "bg-cyan-50 text-cyan-700",
    first_interview: "bg-violet-50 text-violet-700",
    second_interview: "bg-fuchsia-50 text-fuchsia-700",
    rejected: "bg-rose-50 text-rose-700",
    offer: "bg-emerald-50 text-emerald-700",
  };

  return classes[status];
}

export function scoreToText(score?: number): string {
  if (typeof score !== "number") return "-";
  return `${score}%`;
}
