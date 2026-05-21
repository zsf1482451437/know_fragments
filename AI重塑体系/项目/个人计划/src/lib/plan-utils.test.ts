import { describe, expect, it } from 'vitest';
import {
  calculateCompletionRate,
  createArchiveEntry,
  findInvalidTodayTasks,
  getActiveEntry,
  getPlanProgress,
  parseHours,
  reorderTodayTasks,
  setActiveDate,
  sumTodayHours,
  toggleTomorrowCandidate,
  updateTodayTaskStatus,
  upsertTodayTask
} from './plan-utils';
import type { PlanData } from '../types/plan';

const plan: PlanData = {
  updatedAt: '2026-05-21T00:00:00.000Z',
  principles: [],
  activeDate: '2026-05-21',
  entries: [
    {
      date: '2026-05-21',
      coreGoal: '目标',
      totalHours: 4,
      status: '未开始',
      tasks: [
        { id: 'D-1', timebox: '1 小时', title: '任务1', planId: 'RP-001', deliverable: 'A', doneCriteria: 'A', status: '已完成' },
        { id: 'D-2', timebox: '1.5 小时', title: '任务2', planId: 'RP-001', deliverable: 'B', doneCriteria: 'B', status: '进行中' },
        { id: 'D-3', timebox: '1 小时', title: '任务3', planId: 'MAINTAIN', deliverable: 'C', doneCriteria: 'C', status: '取消' }
      ],
      recentPlans: [
        { id: 'RP-001', title: '计划', target: '目标', priority: 'P0', deadline: '本周', progress: 0, nextTask: '下一步' }
      ],
      subTasks: [
        { id: 'T-1', planId: 'RP-001', title: '子任务1', estimate: '1 小时', dependency: '无', output: '输出', status: '已完成' },
        { id: 'T-2', planId: 'RP-001', title: '子任务2', estimate: '1 小时', dependency: 'T-1', output: '输出', status: '待办' }
      ],
      tomorrowCandidates: [
        { id: 'N-1', title: '候选', planId: 'RP-001', reason: '原因', estimate: '1 小时', selected: false }
      ],
      review: {
        completed: '',
        unfinished: '',
        blockers: '',
        tomorrowFocus: '',
        postponedOrDropped: ''
      }
    }
  ]
};

describe('plan-utils', () => {
  it('解析中文工时并汇总今日投入', () => {
    expect(parseHours('1.5 小时')).toBe(1.5);
    expect(sumTodayHours(getActiveEntry(plan).tasks)).toBe(3.5);
  });

  it('完成率忽略取消任务', () => {
    expect(calculateCompletionRate(getActiveEntry(plan).tasks)).toBe(50);
  });

  it('根据子任务计算近期计划进度', () => {
    expect(getPlanProgress(getActiveEntry(plan).recentPlans[0], getActiveEntry(plan).subTasks)).toBe(50);
  });

  it('校验今日任务必须来自近期计划或维护任务', () => {
    expect(findInvalidTodayTasks(getActiveEntry(plan))).toEqual([]);

    const invalidPlan = {
      ...plan,
      entries: [
        {
          ...getActiveEntry(plan),
          tasks: [
            ...getActiveEntry(plan).tasks,
            { ...getActiveEntry(plan).tasks[0], id: 'D-99', planId: 'RP-999' }
          ]
        }
      ]
    };

    expect(findInvalidTodayTasks(getActiveEntry(invalidPlan))).toHaveLength(1);
  });

  it('支持更新状态、候选切换、拖拽排序与新增任务', () => {
    const statusUpdatedPlan = updateTodayTaskStatus(plan, 'D-2', '已完成');
    const toggledPlan = toggleTomorrowCandidate(plan, 'N-1');
    const reorderedPlan = reorderTodayTasks(plan, 0, 1);
    const createdPlan = upsertTodayTask(plan, {
      title: '新任务',
      planId: 'RP-001',
      timebox: '1 小时',
      deliverable: '交付',
      doneCriteria: '完成',
      status: '未开始'
    });

    expect(getActiveEntry(statusUpdatedPlan).tasks[1].status).toBe('已完成');
    expect(getActiveEntry(plan).tasks[1].status).toBe('进行中');
    expect(getActiveEntry(toggledPlan).tomorrowCandidates[0].selected).toBe(true);
    expect(getActiveEntry(reorderedPlan).tasks[0].id).toBe('D-2');
    expect(getActiveEntry(createdPlan).tasks.at(-1)?.title).toBe('新任务');
  });

  it('支持切换活动日期和创建归档日期', () => {
    const archived = createArchiveEntry(plan, '2026-05-22');
    const switched = setActiveDate(archived, '2026-05-21');

    expect(archived.entries).toHaveLength(2);
    expect(archived.activeDate).toBe('2026-05-22');
    expect(switched.activeDate).toBe('2026-05-21');
  });
});
