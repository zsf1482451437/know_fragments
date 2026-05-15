import type { DigestMessage, Notifier } from '@/core/types';

type FeishuNotifierOptions = {
  webhookUrl: string;
  keyword?: string;
};

export class FeishuNotifier implements Notifier {
  readonly name = 'feishu';
  private readonly webhookUrl: string;
  private readonly keyword?: string;

  constructor(options: FeishuNotifierOptions) {
    this.webhookUrl = options.webhookUrl;
    this.keyword = options.keyword?.trim() || undefined;
  }

  async send(message: DigestMessage): Promise<void> {
    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        msg_type: 'text',
        content: {
          text: formatMessageText(message, this.keyword)
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Feishu webhook request failed: ${response.status} ${response.statusText}`);
    }
  }
}

function formatMessageText(message: DigestMessage, keyword?: string): string {
  const segments = [keyword, message.title, message.body].filter((segment): segment is string => Boolean(segment));
  return segments.join('\n\n').replace(`${keyword}\n\n${message.title}`, `${keyword}\n${message.title}`);
}
