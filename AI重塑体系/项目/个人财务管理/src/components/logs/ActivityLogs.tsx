import { useMemo, useState } from 'react';
import type { AuthUserName, OperationLog } from '../../types/finance';
import { Pagination } from '../common/Pagination';
import { formatChinaDate, formatChinaTime } from '../../utils/finance';

interface ActivityLogsProps {
  logs: OperationLog[];
  onOpenRecordLog?: (log: OperationLog) => void;
}

export function ActivityLogs({ logs, onOpenRecordLog }: ActivityLogsProps) {
  const [actorFilter, setActorFilter] = useState<'all' | AuthUserName>('all');
  const [actionFilter, setActionFilter] = useState<'all' | OperationLog['action']>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredLogs = useMemo(
    () => logs
      .filter((log) => actorFilter === 'all' || log.actor === actorFilter)
      .filter((log) => actionFilter === 'all' || log.action === actionFilter)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [actionFilter, actorFilter, logs],
  );
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const pagedLogs = useMemo(
    () => filteredLogs.slice((Math.min(currentPage, totalPages) - 1) * pageSize, Math.min(currentPage, totalPages) * pageSize),
    [currentPage, filteredLogs, totalPages],
  );

  const groupedLogs = useMemo(() => pagedLogs.reduce<Array<{ date: string; items: OperationLog[] }>>((groups, log) => {
    const date = formatChinaDate(log.createdAt);
    const currentGroup = groups[groups.length - 1];
    if (currentGroup?.date === date) {
      currentGroup.items.push(log);
      return groups;
    }
    groups.push({ date, items: [log] });
    return groups;
  }, []), [pagedLogs]);

  const actionOptions = ['all', '登录', '退出登录', '新增流水', '编辑流水', '删除流水'] as const;
  const actorOptions = ['all', 'wenxin', 'sifeng'] as const;

  return (
    <section className="rounded-[1.5rem] bg-white p-5 shadow-soft">
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <h2 className="text-base font-bold text-slate-900">操作日志</h2>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
            <span>用户</span>
            <select
              aria-label="日志用户筛选"
              className="bg-transparent text-slate-700 outline-none"
              onChange={(event) => {
                setActorFilter(event.target.value as 'all' | AuthUserName);
                setCurrentPage(1);
              }}
              value={actorFilter}
            >
              {actorOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? '全部' : option}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
            <span>操作</span>
            <select
              aria-label="日志操作筛选"
              className="bg-transparent text-slate-700 outline-none"
              onChange={(event) => {
                setActionFilter(event.target.value as 'all' | OperationLog['action']);
                setCurrentPage(1);
              }}
              value={actionFilter}
            >
              {actionOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? '全部' : option}
                </option>
              ))}
            </select>
          </label>
          <span className="rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">{filteredLogs.length} 条</span>
        </div>
      </div>
      {groupedLogs.length > 0 ? (
        <div className="space-y-5">
          {groupedLogs.map((group) => (
            <section key={group.date}>
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-mint-50 px-3 py-1 text-xs font-bold text-mint-700">{group.date}</span>
                <span className="text-xs font-semibold text-slate-400">{group.items.length} 条</span>
              </div>
              <div className="space-y-3">
                {group.items.map((log) => (
                  (() => {
                    const isNavigable = Boolean(log.target === 'record' && log.recordId && log.recordMonth && onOpenRecordLog);
                    const content = (
                      <>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-mint-50 px-2.5 py-1 text-xs font-bold text-mint-700">{log.actor}</span>
                          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-500">{log.action}</span>
                          <span className="text-xs font-semibold text-slate-400">{formatChinaTime(log.createdAt)}</span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{log.detail}</p>
                      </>
                    );

                    return isNavigable ? (
                      <button
                        aria-label={`查看流水 ${log.detail}`}
                        className="block w-full rounded-3xl border border-slate-100 p-4 text-left transition hover:border-mint-200 hover:bg-mint-50/40"
                        key={log.id}
                        onClick={() => onOpenRecordLog?.(log)}
                        type="button"
                      >
                        {content}
                      </button>
                    ) : (
                      <article className="rounded-3xl border border-slate-100 p-4" key={log.id}>
                        {content}
                      </article>
                    );
                  })()
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm font-semibold text-slate-400">
          当前筛选条件下暂无日志
        </div>
      )}
      <Pagination currentPage={Math.min(currentPage, totalPages)} onChange={setCurrentPage} totalPages={totalPages} />
    </section>
  );
}
