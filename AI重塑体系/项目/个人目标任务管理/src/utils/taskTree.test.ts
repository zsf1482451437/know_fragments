import { describe, expect, it } from 'vitest';
import { tasks } from '../test/fixtures';
import { getAncestorTasks, getDescendantTasks, getDirectSubtasks, getTaskProgress } from './taskTree';

describe('taskTree', () => {
  it('获取直接子任务和全部后代任务', () => {
    expect(getDirectSubtasks(tasks, 'week-1').map((task) => task.id)).toEqual(['week-1-child']);
    expect(getDescendantTasks(tasks, 'week-1').map((task) => task.id)).toEqual(['week-1-child']);
  });

  it('获取祖先任务链', () => {
    expect(getAncestorTasks(tasks, 'week-1-child').map((task) => task.id)).toEqual(['week-1']);
  });

  it('计算子任务进度', () => {
    expect(getTaskProgress(tasks, 'week-1')).toEqual({ totalCount: 1, completedCount: 0, percentage: 0 });
  });
});
