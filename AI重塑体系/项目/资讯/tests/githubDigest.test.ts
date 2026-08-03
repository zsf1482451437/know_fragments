import { describe, expect, it, vi } from 'vitest';
import type { GitHubTrendingRepo } from '@/core/types';
import { generateDailyGithubDigest, generateWeeklyGithubDigest } from '@/digest/githubDigest';

const baseRepo: GitHubTrendingRepo = {
  source: 'github-trending',
  owner: 'example',
  name: 'alpha',
  repo: 'example/alpha',
  url: 'https://github.com/example/alpha',
  description: 'Alpha toolkit',
  language: 'TypeScript',
  stars: 1000,
  forks: 100,
  starsToday: 120,
  since: 'daily',
  collectedAt: '2026-05-15T08:30:00.000Z'
};

describe('github digest generation', () => {
  it('generates a daily markdown digest ordered by stars today', async () => {
    const digest = await generateDailyGithubDigest([
      { ...baseRepo, repo: 'example/beta', name: 'beta', starsToday: 20 },
      baseRepo
    ], { topN: 1, date: '2026-05-15' });

    expect(digest.title).toBe('GitHub Trending Daily - 2026-05-15');
    expect(digest.body).toContain('## Top 1');
    expect(digest.body).toContain('### 1. [example/alpha](https://github.com/example/alpha)');
    expect(digest.body).toContain('- 做什么：Alpha toolkit');
    expect(digest.body).toContain('- 适用场景：适合 TypeScript 相关工程、自动化脚本或开发工具链场景');
    expect(digest.body).toContain('- 指标：TypeScript | +120 stars today');
    expect(digest.body).not.toContain('example/beta');
  });

  it('uses ai enhancement when an enhancer is configured', async () => {
    const enhanceBatch = vi.fn().mockResolvedValue(
      new Map([
        [
          'example/alpha',
          {
            summary: '一个用于统一工具链的 AI 开发平台',
            useCases: '适合内部研发平台、自动化流水线和 AI coding 规范沉淀'
          }
        ]
      ])
    );

    const digest = await generateDailyGithubDigest([baseRepo], {
      topN: 1,
      date: '2026-05-15',
      aiEnhancer: { enhanceBatch }
    });

    expect(enhanceBatch).toHaveBeenCalledWith([
      expect.objectContaining({ repo: 'example/alpha' })
    ]);
    expect(digest.body).toContain('- 做什么：一个用于统一工具链的 AI 开发平台');
    expect(digest.body).toContain('- 适用场景：适合内部研发平台、自动化流水线和 AI coding 规范沉淀');
  });

  it('generates a weekly markdown digest ranked by appearances and stars today', () => {
    const digest = generateWeeklyGithubDigest([
      baseRepo,
      { ...baseRepo, collectedAt: '2026-05-16T08:30:00.000Z', starsToday: 80 },
      {
        ...baseRepo,
        repo: 'example/beta',
        name: 'beta',
        url: 'https://github.com/example/beta',
        starsToday: 180
      }
    ], { topN: 2, weekLabel: '2026-W20' });

    expect(digest.title).toBe('GitHub Trending Weekly - 2026-W20');
    expect(digest.body).toContain('1. [example/alpha](https://github.com/example/alpha) - 2 appearances - +200 stars today');
    expect(digest.body).toContain('2. [example/beta](https://github.com/example/beta) - 1 appearance - +180 stars today');
  });
});
