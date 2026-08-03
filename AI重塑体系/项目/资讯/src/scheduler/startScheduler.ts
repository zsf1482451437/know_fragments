import cron from 'node-cron';

export type ScheduledJob = {
  start(): void;
  stop(): void;
  destroy(): void;
};

type SchedulerOptions = {
  dailyCron: string;
  weeklyCron: string;
};

type SchedulerDependencies = {
  schedule?: (expression: string, task: () => Promise<void> | void) => ScheduledJob;
  runDaily: () => Promise<void>;
  runWeekly: () => Promise<void>;
};

export function startScheduler(options: SchedulerOptions, dependencies: SchedulerDependencies) {
  const schedule = dependencies.schedule ?? defaultSchedule;
  const jobs = [
    schedule(options.dailyCron, () => dependencies.runDaily()),
    schedule(options.weeklyCron, () => dependencies.runWeekly())
  ];

  return {
    stop(): void {
      for (const job of jobs) {
        job.stop();
        job.destroy();
      }
    }
  };
}

function defaultSchedule(expression: string, task: () => Promise<void> | void): ScheduledJob {
  return cron.schedule(expression, task);
}
