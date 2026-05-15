import { describe, expect, it, vi } from 'vitest';
import { startScheduler } from '@/scheduler/startScheduler';

describe('startScheduler', () => {
  it('registers daily and weekly cron jobs and runs the mapped handlers', async () => {
    const scheduledJobs: Array<{ expression: string; task: () => Promise<void> | void }> = [];
    const runDaily = vi.fn().mockResolvedValue(undefined);
    const runWeekly = vi.fn().mockResolvedValue(undefined);

    const scheduler = startScheduler(
      {
        dailyCron: '30 8 * * *',
        weeklyCron: '30 8 * * 1'
      },
      {
        schedule(expression: string, task: () => Promise<void> | void) {
          scheduledJobs.push({ expression, task });
          return {
            start() {},
            stop() {},
            destroy() {}
          };
        },
        runDaily,
        runWeekly
      }
    );

    expect(scheduledJobs.map((job) => job.expression)).toEqual(['30 8 * * *', '30 8 * * 1']);

    await scheduledJobs[0]?.task();
    await scheduledJobs[1]?.task();

    expect(runDaily).toHaveBeenCalledTimes(1);
    expect(runWeekly).toHaveBeenCalledTimes(1);

    scheduler.stop();
  });
});
