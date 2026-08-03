import { afterEach, describe, expect, it, vi } from 'vitest';
import { FeishuNotifier } from '@/notifiers/feishuNotifier';

describe('FeishuNotifier', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('posts the digest message to the configured Feishu webhook', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK'
    });

    vi.stubGlobal('fetch', fetchMock);

    const notifier = new FeishuNotifier({
      webhookUrl: 'https://open.feishu.cn/open-apis/bot/v2/hook/demo'
    });

    await notifier.send({
      title: 'GitHub Trending Daily - 2026-05-15',
      body: '1. example/project'
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://open.feishu.cn/open-apis/bot/v2/hook/demo',
      expect.objectContaining({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          msg_type: 'text',
          content: {
            text: 'GitHub Trending Daily - 2026-05-15\n\n1. example/project'
          }
        })
      })
    );
  });

  it('prepends the configured keyword to the sent message', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK'
    });

    vi.stubGlobal('fetch', fetchMock);

    const notifier = new FeishuNotifier({
      webhookUrl: 'https://open.feishu.cn/open-apis/bot/v2/hook/demo',
      keyword: 'InfoHub'
    });

    await notifier.send({
      title: 'GitHub Trending Daily - 2026-05-15',
      body: '1. example/project'
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://open.feishu.cn/open-apis/bot/v2/hook/demo',
      expect.objectContaining({
        body: JSON.stringify({
          msg_type: 'text',
          content: {
            text: 'InfoHub\nGitHub Trending Daily - 2026-05-15\n\n1. example/project'
          }
        })
      })
    );
  });

  it('throws when Feishu webhook returns a non-success response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error'
      })
    );

    const notifier = new FeishuNotifier({
      webhookUrl: 'https://open.feishu.cn/open-apis/bot/v2/hook/demo'
    });

    await expect(
      notifier.send({
        title: 'Daily',
        body: 'Digest'
      })
    ).rejects.toThrow('Feishu webhook request failed: 500 Server Error');
  });
});
