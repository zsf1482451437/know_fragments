import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
    expect(screen.getByText('系统掌握 Web3D 工程化能力')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /年度/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /工作/ })).toBeInTheDocument();
  });

  it('后端连接失败时展示错误提示', async () => {
    fetchStateMock.mockRejectedValueOnce(new Error('network'));

    render(<App />);

    expect(await screen.findByText('无法连接 Koa 后端，请确认 npm run dev 已启动。')).toBeInTheDocument();
  });

  it('按项目筛选后展示空状态', async () => {
    fetchStateMock.mockResolvedValueOnce({
      ...appState,
      projects: [...appState.projects, { id: 'empty', name: '空项目', description: '没有任务的项目' }],
    });
    render(<App />);

    await screen.findByText('完成 01-basic-scene');
    fireEvent.click(screen.getByRole('button', { name: /空项目/ }));

    expect(screen.getByText('当前筛选下没有任务')).toBeInTheDocument();
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

  it('编辑任务通过弹窗调用 updateTask', async () => {
    render(<App />);

    await screen.findByText('完成 01-basic-scene');
    fireEvent.click(screen.getAllByRole('button', { name: '编辑' })[0]);
    fireEvent.change(screen.getByLabelText('任务标题'), { target: { value: '编辑后的目标任务' } });
    fireEvent.click(screen.getByRole('button', { name: '保存修改' }));

    await waitFor(() => expect(updateTaskMock).toHaveBeenCalledWith('goal-1', expect.objectContaining({ title: '编辑后的目标任务' })));
  });

  it('支持完成、推进到今日和删除任务', async () => {
    render(<App />);

    await screen.findByText('完成 01-basic-scene');
    fireEvent.click(screen.getAllByLabelText('切换完成状态')[0]);
    fireEvent.click(screen.getAllByRole('button', { name: '放到今日' })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: '删除' })[0]);

    await waitFor(() => expect(updateTaskMock).toHaveBeenCalledWith('goal-1', { completed: true }));
    expect(updateTaskMock).toHaveBeenCalledWith('goal-1', expect.objectContaining({ priority: 'today', completed: false }));
    expect(deleteTaskMock).toHaveBeenCalledWith('goal-1');
  });
});
