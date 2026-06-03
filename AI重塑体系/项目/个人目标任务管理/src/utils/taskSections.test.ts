import { describe, expect, it } from 'vitest';
import type { Task } from '../types/task';
import { projects, tasks } from '../test/fixtures';
import { getTaskSection, getTaskSectionId, priorityToSectionId, sectionIdToPriority } from './taskSections';

describe('taskSections', () => {
  it('根据优先级映射分区 id', () => {
    expect(priorityToSectionId.year).toBe('goals');
    expect(sectionIdToPriority.weekly).toBe('week');
  });

  it('能基于优先级推导非工作任务的分区', () => {
    expect(getTaskSectionId(tasks[1])).toBe('weekly');
    expect(getTaskSection(tasks[1], projects)?.name).toBe('本周');
  });

  it('projectId 错位时仍按优先级归到正确分区', () => {
    const legacyTask: Task = {
      ...tasks[0],
      id: 'legacy-month',
      projectId: 'goals',
      priority: 'month',
    };

    expect(getTaskSectionId(legacyTask)).toBe('monthly');
    expect(getTaskSection(legacyTask, projects)?.name).toBe('本月');
  });
});
