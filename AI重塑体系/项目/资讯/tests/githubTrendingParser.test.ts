import { describe, expect, it } from 'vitest';
import { parseGitHubTrending } from '@/sources/github/githubTrendingParser';

const trendingHtml = `
<article class="Box-row">
  <h2 class="h3 lh-condensed">
    <a href="/modelcontextprotocol/servers">
      <span>modelcontextprotocol</span>
      /
      servers
    </a>
  </h2>
  <p class="col-9 color-fg-muted my-1 pr-4">Model Context Protocol servers</p>
  <span itemprop="programmingLanguage">TypeScript</span>
  <a class="Link--muted d-inline-block mr-3" href="/modelcontextprotocol/servers/stargazers">
    <svg aria-label="star"></svg>
    12,345
  </a>
  <a class="Link--muted d-inline-block mr-3" href="/modelcontextprotocol/servers/forks">
    <svg aria-label="fork"></svg>
    678
  </a>
  <span class="d-inline-block float-sm-right">
    321 stars today
  </span>
</article>
`;

describe('parseGitHubTrending', () => {
  it('extracts normalized repository fields from GitHub Trending HTML', () => {
    const repos = parseGitHubTrending(trendingHtml, {
      collectedAt: '2026-05-15T08:30:00.000Z',
      since: 'daily'
    });

    expect(repos).toEqual([
      {
        source: 'github-trending',
        owner: 'modelcontextprotocol',
        name: 'servers',
        repo: 'modelcontextprotocol/servers',
        url: 'https://github.com/modelcontextprotocol/servers',
        description: 'Model Context Protocol servers',
        language: 'TypeScript',
        stars: 12345,
        forks: 678,
        starsToday: 321,
        since: 'daily',
        collectedAt: '2026-05-15T08:30:00.000Z'
      }
    ]);
  });
});
