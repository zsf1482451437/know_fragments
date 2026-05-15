import type { Notifier } from '@/core/types';
import { generateWeeklyGithubDigest } from '@/digest/githubDigest';
import { SqliteStore } from '@/storage/sqliteStore';

type RunWeeklyGithubSummaryOptions = {
  store: SqliteStore;
  notifier: Notifier;
  topN?: number;
};

export async function runWeeklyGithubSummary(options: RunWeeklyGithubSummaryOptions): Promise<void> {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - 7);

  const repos = options.store.getGitHubTrendingSince(startDate.toISOString());
  const digest = generateWeeklyGithubDigest(repos, {
    topN: options.topN ?? 10,
    weekLabel: getWeekLabel(now)
  });

  await options.notifier.send(digest);
}

function getWeekLabel(date: Date): string {
  const firstDayOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86_400_000;
  const week = Math.ceil((pastDaysOfYear + firstDayOfYear.getUTCDay() + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}
