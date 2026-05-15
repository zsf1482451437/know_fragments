import type { DigestMessage, Notifier } from '@/core/types';

export class ConsoleNotifier implements Notifier {
  readonly name = 'console';

  async send(message: DigestMessage): Promise<void> {
    console.log(`\n${message.title}\n`);
    console.log(message.body);
  }
}
