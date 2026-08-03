import { afterEach, describe, expect, it, vi } from 'vitest';
import { OpenAiDigestEnhancer } from '@/digest/openAiDigestEnhancer';
import type { GitHubTrendingRepo } from '@/core/types';

const repo: GitHubTrendingRepo = {
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

describe('OpenAiDigestEnhancer', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns parsed ai summaries keyed by repo name', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  items: [
                    {
                      repo: 'example/alpha',
                      summary: '一个面向工程自动化的 TypeScript 工具箱',
                      useCases: '适合脚本平台、内部工具和工作流自动化'
                    }
                  ]
                })
              }
            }
          ]
        })
      })
    );

    const enhancer = new OpenAiDigestEnhancer({
      baseUrl: 'https://api.openai.com/v1',
      apiKey: 'demo-key',
      model: 'gpt-4.1-mini'
    });

    const result = await enhancer.enhanceBatch([repo]);

    expect(result.get('example/alpha')).toEqual({
      summary: '一个面向工程自动化的 TypeScript 工具箱',
      useCases: '适合脚本平台、内部工具和工作流自动化'
    });
  });
});
