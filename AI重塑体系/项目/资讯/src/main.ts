import 'dotenv/config';
import { OpenAiDigestEnhancer } from '@/digest/openAiDigestEnhancer';
import { runDailyGithubTrending } from '@/jobs/dailyGithubTrending';
import { runWeeklyGithubSummary } from '@/jobs/weeklyGithubSummary';
import type { TrendingSince } from '@/core/types';
import { createNotifier } from '@/notifiers/createNotifier';
import { startScheduler } from '@/scheduler/startScheduler';

const HELP = `Info Hub

Commands:
  daily:github      Fetch GitHub Trending, save a snapshot, and print daily digest
  weekly:github     Read stored snapshots and print weekly digest
  scheduler:start   Start cron-based daily and weekly jobs
  --help            Print this help

Environment:
  INFO_HUB_DB_PATH              Default: ./data/info-hub.sqlite
  GITHUB_TRENDING_LANGUAGE      Optional language path, for example typescript
  GITHUB_TRENDING_SINCE         daily | weekly | monthly, default daily
  DAILY_PUSH_CRON               Default: 30 8 * * *
  WEEKLY_PUSH_CRON              Default: 30 8 * * 1
  NOTIFIER                      console | feishu, default console
  FEISHU_WEBHOOK_URL            Required when NOTIFIER=feishu
  FEISHU_KEYWORD                Optional keyword prefix for Feishu bot security checks
  AI_SUMMARY_ENABLED            true | false, default false
  AI_SUMMARY_BASE_URL           OpenAI-compatible base URL, default https://api.openai.com/v1
  AI_SUMMARY_API_KEY            API key for AI summary enhancement
  AI_SUMMARY_MODEL              Model name for AI summary enhancement
`;

async function main(): Promise<void> {
  const command = process.argv[2] ?? '--help';

  if (command === '--help' || command === '-h') {
    console.log(HELP);
    return;
  }

  const { SqliteStore } = await import('@/storage/sqliteStore');
  const store = new SqliteStore(process.env.INFO_HUB_DB_PATH ?? './data/info-hub.sqlite');
  const notifier = createNotifier({
    notifierName: process.env.NOTIFIER,
    feishuWebhookUrl: process.env.FEISHU_WEBHOOK_URL,
    feishuKeyword: process.env.FEISHU_KEYWORD
  });
  const aiEnhancer = createAiEnhancer();

  try {
    if (command === 'daily:github') {
      await runDailyGithubTrending({
        store,
        notifier,
        language: process.env.GITHUB_TRENDING_LANGUAGE || undefined,
        since: parseSince(process.env.GITHUB_TRENDING_SINCE),
        aiEnhancer
      });
      return;
    }

    if (command === 'weekly:github') {
      await runWeeklyGithubSummary({ store, notifier });
      return;
    }

    if (command === 'scheduler:start') {
      const scheduler = startScheduler(
        {
          dailyCron: process.env.DAILY_PUSH_CRON ?? '30 8 * * *',
          weeklyCron: process.env.WEEKLY_PUSH_CRON ?? '30 8 * * 1'
        },
        {
          runDaily: () =>
            runDailyGithubTrending({
              store,
              notifier,
              language: process.env.GITHUB_TRENDING_LANGUAGE || undefined,
              since: parseSince(process.env.GITHUB_TRENDING_SINCE),
              aiEnhancer
            }),
          runWeekly: () => runWeeklyGithubSummary({ store, notifier })
        }
      );

      console.log('Scheduler started.');
      console.log(`Daily cron: ${process.env.DAILY_PUSH_CRON ?? '30 8 * * *'}`);
      console.log(`Weekly cron: ${process.env.WEEKLY_PUSH_CRON ?? '30 8 * * 1'}`);

      const shutdown = () => {
        scheduler.stop();
        store.close();
        process.exit(0);
      };

      process.once('SIGINT', shutdown);
      process.once('SIGTERM', shutdown);
      return new Promise(() => {});
    }

    console.error(`Unknown command: ${command}`);
    console.log(HELP);
    process.exitCode = 1;
  } finally {
    if (command !== 'scheduler:start') {
      store.close();
    }
  }
}

function parseSince(value: string | undefined): TrendingSince {
  if (value === 'weekly' || value === 'monthly') {
    return value;
  }

  return 'daily';
}

function createAiEnhancer(): OpenAiDigestEnhancer | undefined {
  if (process.env.AI_SUMMARY_ENABLED !== 'true') {
    return undefined;
  }

  if (!process.env.AI_SUMMARY_API_KEY || !process.env.AI_SUMMARY_MODEL) {
    return undefined;
  }

  return new OpenAiDigestEnhancer({
    baseUrl: process.env.AI_SUMMARY_BASE_URL ?? 'https://api.openai.com/v1',
    apiKey: process.env.AI_SUMMARY_API_KEY,
    model: process.env.AI_SUMMARY_MODEL
  });
}

await main();
