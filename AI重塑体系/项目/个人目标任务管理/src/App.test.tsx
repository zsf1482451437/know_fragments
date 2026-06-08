import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { appState } from './test/fixtures';
import { createTask, deleteTask, fetchState, updateTask } from './services/api';

vi.mock('./services/api', () => ({
  fetchState: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

const fetchStateMock = vi.mocked(fetchState);
const createTaskMock = vi.mocked(createTask);
const updateTaskMock = vi.mocked(updateTask);
const deleteTaskMock = vi.mocked(deleteTask);

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchStateMock.mockResolvedValue(appState);
    createTaskMock.mockResolvedValue(appState);
    updateTaskMock.mockResolvedValue(appState);
    deleteTaskMock.mockResolvedValue(appState);
  });

  it('加载后展示任务看板和新分区', async () => {
    render(<App />);

    expect(screen.getByText('加载中...')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: '个人目标任务管理' })).toBeInTheDocument();
    expect(screen.getByText('完成 01-basic-scene')).toBeInTheDocument();
    expect(screen.getByText('整理工作需求池')).toBeInTheDocument();
    expect(screen.getByText('子任务进度 0/1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /本周/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /工作/ })).toBeInTheDocument();
  });

  it('后端连接失败时展示错误提示', async () => {
    fetchStateMock.mockRejectedValueOnce(new Error('network'));

    render(<App />);

    expect(await screen.findByText('无法连接 Koa 后端，请确认 npm run dev 已启动。')).toBeInTheDocument();
  });

  it('按阶段筛选后展示空状态', async () => {
    fetchStateMock.mockResolvedValueOnce({
      ...appState,
      projects: [...appState.projects, { id: 'empty', name: '空阶段', description: '没有任务的阶段' }],
    });
    render(<App />);

    await screen.findByText('完成 01-basic-scene');
    fireEvent.click(screen.getByRole('button', { name: /空阶段/ }));

    expect(screen.getByText('当前筛选下没有任务')).toBeInTheDocument();
  });

  it('按本周筛选时会展示父任务不在当前视图中的周任务', async () => {
    fetchStateMock.mockResolvedValueOnce({
      ...appState,
      tasks: [
        {
          ...appState.tasks[0],
          id: 'month-parent',
          title: '月度目标',
          projectId: 'monthly',
          priority: 'month',
          parentId: null,
        },
        {
          ...appState.tasks[1],
          id: 'week-child-1',
          title: '周任务一',
          projectId: 'weekly',
          priority: 'week',
          parentId: 'month-parent',
        },
        {
          ...appState.tasks[1],
          id: 'week-child-2',
          title: '周任务二',
          projectId: 'weekly',
          priority: 'week',
          parentId: 'month-parent',
        },
      ],
    });
    render(<App />);

    await screen.findByText('月度目标');
    const sidebar = screen.getByText('阶段分区').closest('aside');
    expect(sidebar).not.toBeNull();
    fireEvent.click(within(sidebar as HTMLElement).getByRole('button', { name: /本周/ }));

    expect(screen.getByText('周任务一')).toBeInTheDocument();
    expect(screen.getByText('周任务二')).toBeInTheDocument();
  });

  it('按本月筛选时月任务仍可展开跨阶段子任务', async () => {
    fetchStateMock.mockResolvedValueOnce({
      ...appState,
      tasks: [
        {
          ...appState.tasks[0],
          id: 'month-parent',
          title: '月度目标',
          projectId: 'monthly',
          priority: 'month',
          parentId: null,
        },
        {
          ...appState.tasks[1],
          id: 'week-child-1',
          title: '周子任务',
          projectId: 'weekly',
          priority: 'week',
          parentId: 'month-parent',
        },
      ],
    });
    render(<App />);

    await screen.findByText('月度目标');
    const sidebar = screen.getByText('阶段分区').closest('aside');
    expect(sidebar).not.toBeNull();
    fireEvent.click(within(sidebar as HTMLElement).getByRole('button', { name: /本月/ }));
    fireEvent.click(screen.getByRole('button', { name: '展开子任务 (1)' }));

    expect(screen.getByText('周子任务')).toBeInTheDocument();
  });

  it('新增任务通过弹窗调用 createTask 并刷新状态', async () => {
    render(<App />);

    await screen.findByText('完成 01-basic-scene');
    fireEvent.click(screen.getByRole('button', { name: '新增下一步动作' }));
    fireEvent.change(screen.getByLabelText('任务标题'), { target: { value: '新增今日任务' } });
    fireEvent.click(screen.getByRole('button', { name: '添加任务' }));

    await waitFor(() => expect(createTaskMock).toHaveBeenCalledWith(expect.objectContaining({ title: '新增今日任务' })));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('工作任务新增时不提交优先级', async () => {
    render(<App />);

    await screen.findByText('完成 01-basic-scene');
    fireEvent.click(screen.getByRole('button', { name: '新增下一步动作' }));
    fireEvent.change(screen.getByLabelText('阶段分区'), { target: { value: 'work' } });
    fireEvent.change(screen.getByLabelText('任务标题'), { target: { value: '新的工作任务' } });
    fireEvent.click(screen.getByRole('button', { name: '添加任务' }));

    await waitFor(() => expect(createTaskMock).toHaveBeenCalledWith(expect.objectContaining({
      title: '新的工作任务',
      projectId: 'work',
      priority: null,
    })));
  });

  it('支持新增子任务', async () => {
    render(<App />);

    const taskTitle = await screen.findByText('完成 01-basic-scene');
    const taskCard = taskTitle.closest('article');
    expect(taskCard).not.toBeNull();
    fireEvent.click(within(taskCard as HTMLElement).getByRole('button', { name: '新增子任务' }));
    fireEvent.change(screen.getByLabelText('任务标题'), { target: { value: '新增周子任务' } });
    fireEvent.click(screen.getByRole('button', { name: '添加任务' }));

    await waitFor(() => expect(createTaskMock).toHaveBeenCalledWith(expect.objectContaining({
      title: '新增周子任务',
      parentId: 'week-1',
      projectId: 'weekly',
      priority: 'week',
    })));
  });

  it('父任务完成时会级联完成子任务', async () => {
    render(<App />);

    const taskTitle = await screen.findByText('完成 01-basic-scene');
    const taskCard = taskTitle.closest('article');
    expect(taskCard).not.toBeNull();
    fireEvent.click(within(taskCard as HTMLElement).getByLabelText('切换完成状态'));

    await waitFor(() => expect(updateTaskMock).toHaveBeenNthCalledWith(1, 'week-1', { completed: true }));
    expect(updateTaskMock).toHaveBeenNthCalledWith(2, 'week-1-child', { completed: true });
  });

  it('子任务取消完成时会回退父任务为未完成', async () => {
    const completedTreeState = {
      ...appState,
      tasks: appState.tasks.map((task) => {
        if (task.id === 'week-1' || task.id === 'week-1-child') {
          return { ...task, completed: true };
        }
        return task;
      }),
    };
    fetchStateMock.mockResolvedValueOnce(completedTreeState);
    render(<App />);

    const taskTitle = await screen.findByText('完成 01-basic-scene');
    const taskCard = taskTitle.closest('article');
    expect(taskCard).not.toBeNull();
    fireEvent.click(within(taskCard as HTMLElement).getByRole('button', { name: '展开子任务 (1)' }));
    const childCard = screen.getByText('输出 basic-scene 结论文档').closest('article');
    expect(childCard).not.toBeNull();
    fireEvent.click(within(childCard as HTMLElement).getByLabelText('切换完成状态'));

    await waitFor(() => expect(updateTaskMock).toHaveBeenNthCalledWith(1, 'week-1-child', { completed: false }));
    expect(updateTaskMock).toHaveBeenNthCalledWith(2, 'week-1', { completed: false });
  });

  it('编辑任务通过弹窗调用 updateTask', async () => {
    render(<App />);

    await screen.findByText('完成 01-basic-scene');
    fireEvent.click(screen.getAllByRole('button', { name: '编辑' })[0]);
    fireEvent.change(screen.getByLabelText('任务标题'), { target: { value: '编辑后的目标任务' } });
    fireEvent.click(screen.getByRole('button', { name: '保存修改' }));

    await waitFor(() => expect(updateTaskMock).toHaveBeenCalledWith('goal-1', expect.objectContaining({ title: '编辑后的目标任务' })));
  });

  it('本年任务只能推进到本月，本周任务才能推进到今日', async () => {
    render(<App />);

    await screen.findByText('系统掌握 Web3D 工程化能力');
    fireEvent.click(screen.getByRole('button', { name: '推进到本月' }));
    fireEvent.click(screen.getByRole('button', { name: '推进到今日' }));

    await waitFor(() => expect(updateTaskMock).toHaveBeenCalledWith('goal-1', expect.objectContaining({ priority: 'month', completed: false })));
    expect(updateTaskMock).toHaveBeenCalledWith('week-1', expect.objectContaining({ priority: 'today', completed: false }));
  });

  it('时间任务支持删除任务', async () => {
    render(<App />);

    await screen.findByText('系统掌握 Web3D 工程化能力');
    fireEvent.click(screen.getAllByRole('button', { name: '删除' })[0]);

    await waitFor(() => expect(deleteTaskMock).toHaveBeenCalledWith('goal-1'));
  });
});
