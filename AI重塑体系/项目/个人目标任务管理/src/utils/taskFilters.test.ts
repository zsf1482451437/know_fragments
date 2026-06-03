import { describe, expect, it } from 'vitest';
import { tasks } from '../test/fixtures';
import { countByPriority, countOpenTasks, countWorkTasks, priorityLabels, priorityStyles } from './taskFilters';

describe('taskFilters', () => {
  it('统计未完成任务数量', () => {
    expect(countOpenTasks(tasks)).toBe(4);
  });

  it('按优先级统计未完成非工作任务', () => {
    expect(countByPriority(tasks, 'today')).toBe(0);
    expect(countByPriority(tasks, 'year')).toBe(1);
    expect(countByPriority(tasks, 'week')).toBe(2);
    expect(countWorkTasks(tasks)).toBe(1);
  });

  it('暴露优先级文案和样式映射', () => {
    expect(priorityLabels.year).toBe('本年');
    expect(priorityStyles.today).toContain('rose');
  });
});
