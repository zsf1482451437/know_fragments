import type { GitHubTrendingRepo, RepoDigestEnhancer, RepoDigestInsight } from '@/core/types';

type OpenAiDigestEnhancerOptions = {
  baseUrl: string;
  apiKey: string;
  model: string;
};

type OpenAiChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

type OpenAiEnhancerPayload = {
  items?: Array<{
    repo?: string;
    summary?: string;
    useCases?: string;
  }>;
};

export class OpenAiDigestEnhancer implements RepoDigestEnhancer {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly model: string;

  constructor(options: OpenAiDigestEnhancerOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/u, '');
    this.apiKey = options.apiKey;
    this.model = options.model;
  }

  async enhanceBatch(repos: GitHubTrendingRepo[]): Promise<Map<string, RepoDigestInsight>> {
    if (repos.length === 0) {
      return new Map();
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.3,
        response_format: {
          type: 'json_object'
        },
        messages: [
          {
            role: 'system',
            content:
              '你是一个技术信息编辑。请根据给定的 GitHub Trending 项目信息，输出中文 JSON。字段为 items: [{repo, summary, useCases}]。summary 用一句中文概括项目核心作用，useCases 用一句中文描述典型应用场景。不要输出 JSON 以外的内容。'
          },
          {
            role: 'user',
            content: JSON.stringify({
              items: repos.map((repo) => ({
                repo: repo.repo,
                description: repo.description ?? '',
                language: repo.language ?? '',
                starsToday: repo.starsToday
              }))
            })
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`AI summary request failed: ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as OpenAiChatResponse;
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      return new Map();
    }

    const parsed = JSON.parse(content) as OpenAiEnhancerPayload;
    const result = new Map<string, RepoDigestInsight>();

    for (const item of parsed.items ?? []) {
      if (!item.repo || !item.summary || !item.useCases) {
        continue;
      }

      result.set(item.repo, {
        summary: item.summary.trim(),
        useCases: item.useCases.trim()
      });
    }

    return result;
  }
}
