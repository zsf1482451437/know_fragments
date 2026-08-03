import type { Notifier, RepoDigestEnhancer, TrendingSince } from '@/core/types';
import { generateDailyGithubDigest } from '@/digest/githubDigest';
import { collectGitHubTrending } from '@/sources/github/githubTrendingCollector';
import { SqliteStore } from '@/storage/sqliteStore';

type RunDailyGithubTrendingOptions = {
  store: SqliteStore;
  notifier: Notifier;
  language?: string;
  since?: TrendingSince;
  topN?: number;
  aiEnhancer?: RepoDigestEnhancer;
};

export async function runDailyGithubTrending(options: RunDailyGithubTrendingOptions): Promise<void> {
  const collectedAt = new Date().toISOString();
  const repos = await collectGitHubTrending({
    language: options.language,
    since: options.since ?? 'daily',
    collectedAt
  });

  options.store.saveGitHubTrending(repos);

  const digest = await generateDailyGithubDigest(repos, {
    topN: options.topN ?? 10,
    date: collectedAt.slice(0, 10),
    aiEnhancer: options.aiEnhancer
  });

  await options.notifier.send(digest);
}
