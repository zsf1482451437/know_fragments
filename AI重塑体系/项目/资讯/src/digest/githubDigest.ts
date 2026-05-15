import type { DigestMessage, GitHubTrendingRepo, RepoDigestEnhancer, RepoDigestInsight } from '@/core/types';

type DailyDigestOptions = {
  topN: number;
  date: string;
  aiEnhancer?: RepoDigestEnhancer;
};

type WeeklyDigestOptions = {
  topN: number;
  weekLabel: string;
};

export async function generateDailyGithubDigest(
  repos: GitHubTrendingRepo[],
  options: DailyDigestOptions
): Promise<DigestMessage> {
  const topRepos = [...repos]
    .sort((left, right) => right.starsToday - left.starsToday)
    .slice(0, options.topN);
  const aiInsights = await getAiInsights(topRepos, options.aiEnhancer);

  return {
    title: `GitHub Trending Daily - ${options.date}`,
    body: [
      `# GitHub Trending Daily - ${options.date}`,
      `## Top ${options.topN}`,
      ...topRepos.map((repo, index) => formatDailyRepo(repo, index, aiInsights.get(repo.repo)))
    ].join('\n\n')
  };
}

export function generateWeeklyGithubDigest(
  repos: GitHubTrendingRepo[],
  options: WeeklyDigestOptions
): DigestMessage {
  const grouped = new Map<string, GitHubTrendingRepo & { appearances: number; totalStarsToday: number }>();

  for (const repo of repos) {
    const current = grouped.get(repo.repo);
    if (!current) {
      grouped.set(repo.repo, { ...repo, appearances: 1, totalStarsToday: repo.starsToday });
      continue;
    }

    current.appearances += 1;
    current.totalStarsToday += repo.starsToday;
  }

  const topRepos = [...grouped.values()]
    .sort((left, right) => {
      if (right.appearances !== left.appearances) {
        return right.appearances - left.appearances;
      }

      return right.totalStarsToday - left.totalStarsToday;
    })
    .slice(0, options.topN);

  return {
    title: `GitHub Trending Weekly - ${options.weekLabel}`,
    body: [`# GitHub Trending Weekly - ${options.weekLabel}`, '## Repeatedly Trending', ...topRepos.map(formatWeeklyRepo)].join(
      '\n\n'
    )
  };
}

function formatDailyRepo(repo: GitHubTrendingRepo, index: number, insight?: RepoDigestInsight): string {
  const language = repo.language ?? 'Unknown';
  const description = insight?.summary ?? repo.description ?? '暂无项目简介';
  const useCases = insight?.useCases ?? inferUseCases(repo);

  return [
    `### ${index + 1}. [${repo.repo}](${repo.url})`,
    `- 做什么：${description}`,
    `- 适用场景：${useCases}`,
    `- 指标：${language} | +${repo.starsToday} stars today`
  ].join('\n');
}

async function getAiInsights(
  repos: GitHubTrendingRepo[],
  aiEnhancer?: RepoDigestEnhancer
): Promise<Map<string, RepoDigestInsight>> {
  if (!aiEnhancer || repos.length === 0) {
    return new Map();
  }

  try {
    return await aiEnhancer.enhanceBatch(repos);
  } catch {
    return new Map();
  }
}

function formatWeeklyRepo(
  repo: GitHubTrendingRepo & { appearances: number; totalStarsToday: number },
  index: number
): string {
  const appearanceText = repo.appearances === 1 ? 'appearance' : 'appearances';
  return `${index + 1}. [${repo.repo}](${repo.url}) - ${repo.appearances} ${appearanceText} - +${
    repo.totalStarsToday
  } stars today`;
}

function inferUseCases(repo: GitHubTrendingRepo): string {
  const language = repo.language ?? '通用';
  const description = `${repo.description ?? ''}`.toLowerCase();

  if (description.includes('agent')) {
    return `适合 ${language} 相关 AI Agent、自动化助手和工作流编排场景`;
  }

  if (description.includes('browser')) {
    return `适合 ${language} 相关浏览器扩展、隐私工具和 Web 交互场景`;
  }

  if (description.includes('audio') || description.includes('voice') || description.includes('speech')) {
    return `适合 ${language} 相关音频处理、语音生成和多媒体应用场景`;
  }

  if (description.includes('toolkit') || description.includes('framework') || description.includes('sdk')) {
    return `适合 ${language} 相关工程、自动化脚本或开发工具链场景`;
  }

  return `适合 ${language} 相关工程、效率工具和垂直业务落地场景`;
}
