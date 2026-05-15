import type { Notifier } from '@/core/types';
import { ConsoleNotifier } from '@/notifiers/consoleNotifier';
import { FeishuNotifier } from '@/notifiers/feishuNotifier';

type CreateNotifierOptions = {
  notifierName?: string;
  feishuWebhookUrl?: string;
  feishuKeyword?: string;
};

export function createNotifier(options: CreateNotifierOptions): Notifier {
  if (options.notifierName === 'feishu') {
    if (!options.feishuWebhookUrl) {
      throw new Error('FEISHU_WEBHOOK_URL is required when NOTIFIER=feishu');
    }

    return new FeishuNotifier({
      webhookUrl: options.feishuWebhookUrl,
      keyword: options.feishuKeyword
    });
  }

  return new ConsoleNotifier();
}
