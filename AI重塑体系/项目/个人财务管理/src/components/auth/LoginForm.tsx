import { useState } from 'react';
import type { FormEvent } from 'react';
import type { AuthUserName } from '../../types/finance';

interface LoginFormProps {
  error?: string;
  onSubmit: (userName: AuthUserName, password: string) => Promise<void>;
}

const users: AuthUserName[] = ['wenxin', 'sifeng'];

export function LoginForm({ error = '', onSubmit }: LoginFormProps) {
  const [userName, setUserName] = useState<AuthUserName>('wenxin');
  const [password, setPassword] = useState('1314');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(userName, password);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-soft md:p-7">
      <div className="mb-5">
        <p className="text-sm font-semibold text-mint-600">用户登录</p>
        <h1 className="mt-1 text-2xl font-black text-slate-900">进入财务记录系统</h1>
        <p className="mt-2 text-sm text-slate-400">登录后可查看全部流水，系统会记录每位用户的操作日志。</p>
      </div>
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-1 text-sm font-semibold text-slate-600">
          用户
          <select
            aria-label="用户"
            className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 outline-none transition focus:border-mint-300 focus:bg-white"
            onChange={(event) => setUserName(event.target.value as AuthUserName)}
            value={userName}
          >
            {users.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-600">
          <span className="flex items-center justify-between gap-3">
            <span>密码</span>
            <button
              aria-label={showPassword ? '隐藏密码' : '显示密码'}
              className="text-xs font-semibold text-slate-400 transition hover:text-mint-600"
              onClick={() => setShowPassword((current) => !current)}
              type="button"
            >
              {showPassword ? '隐藏' : '显示'}
            </button>
          </span>
          <input
            aria-label="密码"
            className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 outline-none transition focus:border-mint-300 focus:bg-white"
            onChange={(event) => setPassword(event.target.value)}
            type={showPassword ? 'text' : 'password'}
            value={password}
          />
        </label>
        {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">{error}</p> : null}
        <button className="rounded-2xl bg-mint-500 px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-mint-600 disabled:opacity-60" disabled={submitting} type="submit">
          {submitting ? '登录中...' : '登录'}
        </button>
      </form>
    </section>
  );
}
