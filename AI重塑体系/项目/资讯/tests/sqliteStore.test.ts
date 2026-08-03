import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { GitHubTrendingRepo } from '@/core/types';
import { SqliteStore } from '@/storage/sqliteStore';

const tempDirs: string[] = [];

describe('SqliteStore', () => {
  afterEach(() => {
    while (tempDirs.length > 0) {
      const dir = tempDirs.pop();
      if (dir) {
        rmSync(dir, { recursive: true, force: true });
      }
    }
  });

  it('saves and reads github trending snapshots without binding extra fields', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'info-hub-sqlite-'));
    tempDirs.push(tempDir);

    const store = new SqliteStore(join(tempDir, 'info-hub.sqlite'));
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
      starsToday: 50,
      since: 'daily',
      collectedAt: '2026-05-15T08:30:00.000Z'
    };

    expect(() => store.saveGitHubTrending([repo])).not.toThrow();

    const rows = store.getGitHubTrendingSince('2026-05-15T00:00:00.000Z');
    expect(rows).toEqual([repo]);

    store.close();
  });
});
