import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createRecord, readState, writeState } from './storage.js';

let tempDir = '';

beforeEach(async () => {
  tempDir = await mkdtemp(path.join(tmpdir(), 'finance-storage-'));
  process.env.FINANCE_DATA_FILE = path.join(tempDir, 'finance.json');
});

afterEach(async () => {
  delete process.env.FINANCE_DATA_FILE;
  await rm(tempDir, { recursive: true, force: true });
});

describe('finance storage', () => {
  it('不存在 JSON 文件时自动创建空状态', async () => {
    await expect(readState()).resolves.toEqual({ records: [] });
  });

  it('写入后可以读回财务状态', async () => {
    await writeState({ records: [{
      id: '1',
      month: '2026-06',
      date: '2026-06-01',
      type: 'income',
      title: '工资',
      amount: 100,
      note: '',
      createdAt: '2026-06-01T00:00:00.000Z',
      updatedAt: '2026-06-01T00:00:00.000Z',
    }] });

    expect((await readState()).records[0].title).toBe('工资');
  });

  it('创建记录时归一化金额、月份并保留空名称和备注', () => {
    const record = createRecord({ date: '2026-06-15', amount: -10 });

    expect(record.month).toBe('2026-06');
    expect(record.type).toBe('expense');
    expect(record.title).toBe('');
    expect(record.note).toBe('');
    expect(record.amount).toBe(0);
  });

  it('创建记录时允许预收入类型', () => {
    const record = createRecord({ date: '2026-06-15', amount: 500, type: 'preincome' });

    expect(record.type).toBe('preincome');
    expect(record.amount).toBe(500);
  });
});
