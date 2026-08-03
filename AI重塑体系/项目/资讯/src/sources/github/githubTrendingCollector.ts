import type { GitHubTrendingRepo, TrendingSince } from '@/core/types';
import { parseGitHubTrending } from '@/sources/github/githubTrendingParser';

type CollectGitHubTrendingOptions = {
  language?: string;
  since?: TrendingSince;
  collectedAt?: string;
};

const GITHUB_TRENDING_URL = 'https://github.com/trending';

export async function collectGitHubTrending(
  options: CollectGitHubTrendingOptions = {}
): Promise<GitHubTrendingRepo[]> {
  const since = options.since ?? 'daily';
  const url = buildTrendingUrl({ language: options.language, since });
  const response = await fetch(url, {
    headers: {
      accept: 'text/html',
      'user-agent': 'info-hub-github-trending/0.1'
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub Trending request failed: ${response.status} ${response.statusText}`);
  }

  return parseGitHubTrending(await response.text(), {
    collectedAt: options.collectedAt ?? new Date().toISOString(),
    since
  });
}

function buildTrendingUrl(options: { language?: string; since: TrendingSince }): string {
  const languagePath = options.language ? `/${encodeURIComponent(options.language)}` : '';
  const url = new URL(`${GITHUB_TRENDING_URL}${languagePath}`);
  url.searchParams.set('since', options.since);
  return url.toString();
}
