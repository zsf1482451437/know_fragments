export type CompanyStage =
  | "no_financing"
  | "angel"
  | "series_a"
  | "series_b"
  | "series_c"
  | "series_d"
  | "listed"
  | "unknown";

export type JobTier = "practice" | "fit" | "target";

export type UserIntent = "unset" | "not_interested" | "normal" | "want";

export type ApplicationStatus =
  | "pending_apply"
  | "communicated"
  | "applied"
  | "pending_interview"
  | "first_interview"
  | "second_interview"
  | "rejected"
  | "offer";

export type Priority = "P0" | "P1" | "P2" | "P3" | "P4";

export type SalaryLiftLevel =
  | "below_current"
  | "same"
  | "small_increase"
  | "good_increase"
  | "high_increase";

export type GreetingStatus = "not_generated" | "generated" | "sent" | "replied";

export type WorkMode = "onsite" | "hybrid" | "remote" | "unknown";

export type TechTag =
  | "react"
  | "vue"
  | "typescript"
  | "nextjs"
  | "nuxt"
  | "react_native"
  | "nodejs"
  | "python"
  | "tailwindcss"
  | "webpack"
  | "vite"
  | "monorepo"
  | "turborepo"
  | "websocket"
  | "sse"
  | "ai_agent"
  | "ai_coding"
  | "low_code"
  | "data_visualization"
  | "webgl"
  | "android"
  | "golang"
  | "docker"
  | "cicd";

export type BusinessTag =
  | "ecommerce"
  | "b2b"
  | "ai_application"
  | "agent_workflow"
  | "admin_dashboard"
  | "mobile_app"
  | "hybrid_app"
  | "iot"
  | "robotics"
  | "social"
  | "finance"
  | "bank"
  | "data_platform"
  | "marketing_page"
  | "visual_editor";

export type RiskTag =
  | "requires_5_years"
  | "requires_4_years"
  | "requires_native_android"
  | "requires_deep_backend"
  | "requires_database"
  | "requires_ai_model"
  | "requires_webgl"
  | "requires_golang"
  | "vue_first"
  | "salary_low"
  | "jd_too_generic"
  | "startup_uncertainty";

export interface Job {
  id: string;
  sourceIndex?: number;
  companyName: string;
  companyStage: CompanyStage;
  jobTitle?: string;
  salaryText: string;
  salaryMinK?: number;
  salaryMaxK?: number;
  currentSalaryK?: number;
  salaryLiftLevel?: SalaryLiftLevel;
  jdRaw: string;
  responsibilities?: string[];
  requirements?: string[];
  bonusItems?: string[];
  techStack?: TechTag[];
  businessTags?: BusinessTag[];
  riskTags?: RiskTag[];
  stageTier: JobTier;
  fitTier: JobTier;
  userIntent: UserIntent;
  matchScore?: number;
  priority?: Priority;
  applicationStatus: ApplicationStatus;
  greetingStatus?: GreetingStatus;
  resumeVersion?: string;
  customGreeting?: string;
  fitReason?: string;
  riskReason?: string;
  prepNotes?: string[];
  interviewQuestions?: string[];
  sourceUrl?: string;
  city?: string;
  workMode?: WorkMode;
  createdAt: string;
  updatedAt: string;
  lastContactedAt?: string;
  remark?: string;
}

export interface JobDatabase {
  version: number;
  currentSalaryK: number;
  updatedAt: string;
  jobs: Job[];
}

export interface JobFilters {
  keyword: string;
  tier: JobTier | "all";
  status: ApplicationStatus | "all";
  stage: CompanyStage | "all";
}

export type EditableJob = Omit<Job, "createdAt" | "updatedAt"> & {
  createdAt?: string;
  updatedAt?: string;
};
