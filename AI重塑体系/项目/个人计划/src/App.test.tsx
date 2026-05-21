import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import type { PlanData } from './types/plan';

const createMockPlan = (): PlanData => ({
  updatedAt: '2026-05-21T00:00:00.000Z',
  principles: ['每天只维护一个核心目标，最多 3 个今日任务。'],
  activeDate: '2026-05-21',
  entries: [
    {
      date: '2026-05-21',
      coreGoal: '完成日历项目首轮测试并沉淀问题清单',
      totalHours: 4,
      status: '未开始',
      tasks: [
        {
          id: 'D-001',
          timebox: '1 小时',
          title: '梳理日历项目功能入口和测试范围',
          planId: 'RP-001',
          deliverable: '测试范围清单',
          doneCriteria: '列出核心页面、核心流程和测试优先级',
          status: '未开始'
        },
        {
          id: 'D-002',
          timebox: '1 小时',
          title: '运行并完成首轮核心流程测试',
          planId: 'RP-001',
          deliverable: '测试记录',
          doneCriteria: '覆盖核心流程',
          status: '进行中'
        }
      ],
      recentPlans: [
        {
          id: 'RP-001',
          title: '测试日历项目',
          target: '完成一轮可复用的测试清单和问题记录',
          priority: 'P0',
          deadline: '本周内',
          progress: 0,
          nextTask: '梳理测试范围并执行首轮测试'
        },
        {
          id: 'RP-002',
          title: '学习 Web3D 技术',
          target: '建立 Web3D 技术地图并完成一个入门 Demo',
          priority: 'P1',
          deadline: '近期',
          progress: 0,
          nextTask: '先确认 Three.js 学习路径'
        }
      ],
      subTasks: [
        {
          id: 'T-001',
          planId: 'RP-001',
          title: '梳理日历项目测试范围和测试顺序',
          estimate: '1 小时',
          dependency: '无',
          output: '测试范围清单',
          status: '今日'
        },
        {
          id: 'T-002',
          planId: 'RP-002',
          title: '输出 Web3D 技术路线图',
          estimate: '1 小时',
          dependency: '无',
          output: '技术路线图',
          status: '待办'
        }
      ],
      tomorrowCandidates: [
        {
          id: 'N-001',
          title: '补充日历项目边界场景测试',
          planId: 'RP-001',
          reason: '首轮核心流程后自然延续',
          estimate: '1 小时',
          selected: false
        }
      ],
      review: {
        completed: '完成首页改造',
        unfinished: '补齐边界场景',
        blockers: '暂无',
        tomorrowFocus: '继续测试边界场景',
        postponedOrDropped: ''
      }
    },
    {
      date: '2026-05-20',
      coreGoal: '归档目标',
      totalHours: 4,
      status: '已完成',
      tasks: [],
      recentPlans: [],
      subTasks: [],
      tomorrowCandidates: [],
      review: {
        completed: '旧记录',
        unfinished: '',
        blockers: '',
        tomorrowFocus: '',
        postponedOrDropped: ''
      }
    }
  ]
});

describe('App', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('展示标签页和主工作台', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => createMockPlan() }));

    render(<App />);

    expect(await screen.findByText('个人计划系统')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '总览' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '任务' })).toBeInTheDocument();
    expect(screen.getByText('今天的核心目标')).toBeInTheDocument();
  });

  it('支持标签切换和归档日期切换', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => createMockPlan() }));

    render(<App />);

    await userEvent.click(await screen.findByRole('button', { name: '归档' }));
    expect(screen.getByText('日期归档')).toBeInTheDocument();
    expect(screen.getByText('复盘摘要')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /5月20日/ }));
    expect(screen.getByText('旧记录')).toBeInTheDocument();
  });

  it('支持新增任务、编辑任务和保存到 JSON', async () => {
    const savedPlan = createMockPlan();
    savedPlan.updatedAt = '2026-05-21T01:00:00.000Z';

    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => createMockPlan() })
      .mockResolvedValueOnce({ ok: true, json: async () => savedPlan });
    vi.stubGlobal('fetch', fetchMock);

    render(<App />);

    await userEvent.click(await screen.findByRole('button', { name: '任务' }));
    await userEvent.click(screen.getByRole('button', { name: '新增任务' }));
    await userEvent.type(screen.getByLabelText('任务标题'), '新增的今日任务');
    await userEvent.type(screen.getByLabelText('交付物'), '任务交付物');
    await userEvent.type(screen.getByLabelText('完成标准'), '任务完成标准');
    await userEvent.click(screen.getByRole('button', { name: '保存任务' }));
    expect(screen.getByText('新增的今日任务')).toBeInTheDocument();

    await userEvent.click(screen.getAllByRole('button', { name: '编辑' })[0]);
    const titleInput = screen.getByLabelText('任务标题');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, '已编辑任务');
    await userEvent.click(screen.getByRole('button', { name: '保存任务' }));
    expect(screen.getByText('已编辑任务')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '保存到 JSON' }));
    await waitFor(() => expect(screen.getByText('已保存到 data/plan.json')).toBeInTheDocument());
    expect(fetchMock).toHaveBeenLastCalledWith('/api/plan', expect.objectContaining({ method: 'PUT' }));
  });

  it('支持拖拽调整任务顺序', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => createMockPlan() }));

    render(<App />);

    await userEvent.click(await screen.findByRole('button', { name: '任务' }));
    const cardsBefore = screen.getAllByText(/#\d/).map((node) => node.parentElement?.parentElement?.querySelector('h3')?.textContent);
    expect(cardsBefore[0]).toBe('梳理日历项目功能入口和测试范围');

    const draggableCards = screen.getAllByText(/#\d/).map((node) => node.closest('article')).filter(Boolean) as HTMLElement[];
    fireEvent.dragStart(draggableCards[0]);
    fireEvent.dragOver(draggableCards[1]);
    fireEvent.drop(draggableCards[1]);

    const cardsAfter = screen.getAllByText(/#\d/).map((node) => node.parentElement?.parentElement?.querySelector('h3')?.textContent);
    expect(cardsAfter[0]).toBe('运行并完成首轮核心流程测试');
  });

  it('支持勾选候选任务并创建新归档日期', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => createMockPlan() }));

    render(<App />);

    await userEvent.click(await screen.findByRole('button', { name: '任务' }));
    await userEvent.click(screen.getByRole('checkbox', { name: '切换 补充日历项目边界场景测试' }));
    expect(screen.getByText('已选中')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '归档' }));
    const dateInput = screen.getByLabelText('新增归档日期');
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, '2026-05-22');
    await userEvent.click(screen.getByRole('button', { name: '新建日期' }));

    expect(screen.getByRole('button', { name: /5月22日/ })).toBeInTheDocument();
    expect(screen.getAllByText('待填写').length).toBeGreaterThan(0);
  });

  it('支持项目页二级 Tab、搜索和状态筛选', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => createMockPlan() }));

    render(<App />);

    await userEvent.click(await screen.findByRole('button', { name: '项目' }));
    expect(screen.getByRole('button', { name: '近期计划' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '子任务池' })).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('项目搜索框'), 'Web3D');
    expect(screen.getByText('学习 Web3D 技术')).toBeInTheDocument();
    expect(screen.queryByText('测试日历项目')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '子任务池' }));
    await userEvent.selectOptions(screen.getByLabelText('子任务状态筛选'), '待办');
    const table = screen.getByRole('table');
    expect(within(table).getByText('输出 Web3D 技术路线图')).toBeInTheDocument();
    expect(within(table).queryByText('梳理日历项目测试范围和测试顺序')).not.toBeInTheDocument();
  });

  it('任务开始后倒计时并在结束时弹出状态选择框', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => createMockPlan() }));

    render(<App />);

    await screen.findByRole('button', { name: '任务' });
    vi.useFakeTimers();
    fireEvent.click(screen.getByRole('button', { name: '任务' }));
    fireEvent.click(screen.getAllByRole('button', { name: '开始 1h' })[0]);

    expect(screen.getByText('倒计时 60:00')).toBeInTheDocument();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60 * 60 * 1000);
    });

    expect(screen.getByText('倒计时结束')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('倒计时结束状态'), { target: { value: '顺延' } });
    fireEvent.click(screen.getByRole('button', { name: '更新状态' }));

    expect(screen.getAllByText('顺延').length).toBeGreaterThan(0);
  });
});
