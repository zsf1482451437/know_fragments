import { describe, expect, it } from 'vitest';
import { tasks } from '../test/fixtures';
import { countByPriority, countOpenTasks, priorityLabels, priorityStyles } from './taskFilters';

describe('taskFilters', () => {
  it('统计未完成任务数量', () => {
    expect(countOpenTasks(tasks)).toBe(2);
  });

  it('按优先级统计未完成任务', () => {
    expect(countByPriority(tasks, 'today')).toBe(1);
    expect(countByPriority(tasks, 'year')).toBe(1);
    expect(countByPriority(tasks, 'week')).toBe(0);
  });

  it('暴露优先级文案和样式映射', () => {
    expect(priorityLabels.year).toBe('本年');
    expect(priorityStyles.today).toContain('rose');
  });
});
