import * as cheerio from 'cheerio';
import type { GitHubTrendingParseOptions, GitHubTrendingRepo } from '@/core/types';

const GITHUB_ORIGIN = 'https://github.com';

export function parseGitHubTrending(
  html: string,
  options: GitHubTrendingParseOptions
): GitHubTrendingRepo[] {
  const $ = cheerio.load(html);
  const repos: GitHubTrendingRepo[] = [];

  $('article.Box-row').each((_, article) => {
    const root = $(article);
    const repoLink = root.find('h2 a').first();
    const href = repoLink.attr('href')?.trim();
    const repo = normalizeRepoName(repoLink.text());

    if (!href || !repo.includes('/')) {
      return;
    }

    const [owner, name] = repo.split('/');
    const mutedLinks = root.find('a.Link--muted');

    repos.push({
      source: 'github-trending',
      owner,
      name,
      repo,
      url: new URL(href, GITHUB_ORIGIN).toString(),
      description: normalizeText(root.find('p').first().text()) || undefined,
      language: normalizeText(root.find('[itemprop="programmingLanguage"]').first().text()) || undefined,
      stars: parseCount($(mutedLinks.get(0)).text()),
      forks: parseCount($(mutedLinks.get(1)).text()),
      starsToday: parseCount(root.find('.float-sm-right').first().text()),
      since: options.since,
      collectedAt: options.collectedAt
    });
  });

  return repos;
}

function normalizeRepoName(value: string): string {
  return normalizeText(value).replace(/\s*\/\s*/u, '/');
}

function normalizeText(value: string): string {
  return value.replace(/\s+/gu, ' ').trim();
}

function parseCount(value: string): number {
  const match = value.replace(/,/gu, '').match(/\d+/u);
  return match ? Number.parseInt(match[0], 10) : 0;
}
