export type TaskStatus = '未开始' | '进行中' | '已完成' | '顺延' | '取消' | '阻塞' | '今日' | '待办';
export type PlanPriority = 'P0' | 'P1' | 'P2';

export interface TodayTask {
  id: string;
  timebox: string;
  title: string;
  planId: string;
  deliverable: string;
  doneCriteria: string;
  status: TaskStatus;
}

export interface DayPlanMeta {
  date: string;
  coreGoal: string;
  totalHours: number;
  status: Exclude<TaskStatus, '今日' | '待办'>;
  tasks: TodayTask[];
}

export interface RecentPlan {
  id: string;
  title: string;
  target: string;
  priority: PlanPriority;
  deadline: string;
  progress: number;
  nextTask: string;
}

export interface SubTask {
  id: string;
  planId: string;
  title: string;
  estimate: string;
  dependency: string;
  output: string;
  status: Extract<TaskStatus, '今日' | '待办' | '已完成' | '顺延' | '取消' | '阻塞'>;
}

export interface TomorrowCandidate {
  id: string;
  title: string;
  planId: string;
  reason: string;
  estimate: string;
  selected: boolean;
}

export interface DailyReview {
  completed: string;
  unfinished: string;
  blockers: string;
  tomorrowFocus: string;
  postponedOrDropped: string;
}

export interface PlanEntry {
  date: string;
  coreGoal: string;
  totalHours: number;
  status: Exclude<TaskStatus, '今日' | '待办'>;
  tasks: TodayTask[];
  recentPlans: RecentPlan[];
  subTasks: SubTask[];
  tomorrowCandidates: TomorrowCandidate[];
  review: DailyReview;
}

export interface PlanData {
  updatedAt: string;
  principles: string[];
  activeDate: string;
  entries: PlanEntry[];
}

export interface TaskFormValues {
  id?: string;
  timebox: string;
  title: string;
  planId: string;
  deliverable: string;
  doneCriteria: string;
  status: Exclude<TaskStatus, '今日' | '待办'>;
}
