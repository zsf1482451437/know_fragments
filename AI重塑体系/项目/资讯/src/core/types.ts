export type TrendingSince = 'daily' | 'weekly' | 'monthly';

export type GitHubTrendingRepo = {
  source: 'github-trending';
  owner: string;
  name: string;
  repo: string;
  url: string;
  description?: string;
  language?: string;
  stars: number;
  forks: number;
  starsToday: number;
  since: TrendingSince;
  collectedAt: string;
};

export type GitHubTrendingParseOptions = {
  collectedAt: string;
  since: TrendingSince;
};

export type DigestMessage = {
  title: string;
  body: string;
};

export type RepoDigestInsight = {
  summary: string;
  useCases: string;
};

export interface RepoDigestEnhancer {
  enhanceBatch(repos: GitHubTrendingRepo[]): Promise<Map<string, RepoDigestInsight>>;
}

export interface Notifier {
  name: string;
  send(message: DigestMessage): Promise<void>;
}
