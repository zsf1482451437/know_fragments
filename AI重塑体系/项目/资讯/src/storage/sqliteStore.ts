import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { GitHubTrendingRepo } from '@/core/types';

export class SqliteStore {
  private readonly db: DatabaseSync;

  constructor(dbPath: string) {
    mkdirSync(dirname(dbPath), { recursive: true });
    this.db = new DatabaseSync(dbPath);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS github_trending_snapshots (
        repo TEXT NOT NULL,
        owner TEXT NOT NULL,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        description TEXT,
        language TEXT,
        stars INTEGER NOT NULL,
        forks INTEGER NOT NULL,
        stars_today INTEGER NOT NULL,
        since_value TEXT NOT NULL,
        collected_at TEXT NOT NULL,
        PRIMARY KEY (repo, collected_at, since_value)
      )
    `);
  }

  saveGitHubTrending(repos: GitHubTrendingRepo[]): void {
    const insert = this.db.prepare(`
      INSERT OR REPLACE INTO github_trending_snapshots (
        repo, owner, name, url, description, language, stars, forks, stars_today, since_value, collected_at
      ) VALUES (
        @repo, @owner, @name, @url, @description, @language, @stars, @forks, @starsToday, @since, @collectedAt
      )
    `);

    this.db.exec('BEGIN');
    try {
      for (const repo of repos) {
        insert.run({
          repo: repo.repo,
          owner: repo.owner,
          name: repo.name,
          url: repo.url,
          description: repo.description ?? null,
          language: repo.language ?? null,
          stars: repo.stars,
          forks: repo.forks,
          starsToday: repo.starsToday,
          since: repo.since,
          collectedAt: repo.collectedAt
        });
      }
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }

  getGitHubTrendingSince(startDateIso: string): GitHubTrendingRepo[] {
    const rows = this.db
      .prepare(
        `
        SELECT repo, owner, name, url, description, language, stars, forks, stars_today, since_value, collected_at
        FROM github_trending_snapshots
        WHERE collected_at >= ?
        ORDER BY collected_at DESC, stars_today DESC
      `
      )
      .all(startDateIso) as StoredGitHubTrendingRow[];

    return rows.map(rowToRepo);
  }

  close(): void {
    this.db.close();
  }
}

type StoredGitHubTrendingRow = {
  repo: string;
  owner: string;
  name: string;
  url: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  stars_today: number;
  since_value: GitHubTrendingRepo['since'];
  collected_at: string;
};

function rowToRepo(row: StoredGitHubTrendingRow): GitHubTrendingRepo {
  return {
    source: 'github-trending',
    repo: row.repo,
    owner: row.owner,
    name: row.name,
    url: row.url,
    description: row.description ?? undefined,
    language: row.language ?? undefined,
    stars: row.stars,
    forks: row.forks,
    starsToday: row.stars_today,
    since: row.since_value,
    collectedAt: row.collected_at
  };
}
