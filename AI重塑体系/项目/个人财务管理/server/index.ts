import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import serve from 'koa-static';
import path from 'node:path';
import { createSession, getTokenFromHeader, getUserNameByToken, removeSession, validateCredentials } from './auth.js';
import { createOperationLog, createRecord, readState, writeState } from './storage.js';
import type { AuthUserName, FinanceRecord, FinanceRecordDraft, FinanceState } from './types.js';

const app = new Koa();
const router = new Router({ prefix: '/api' });
const port = Number(process.env.PORT || 4176);

function appendLog(state: FinanceState, actor: AuthUserName | 'anonymous', action: string, target: string, detail: string) {
  state.logs.unshift(createOperationLog({ actor, action, target, detail }));
}

function getRecordLogDetail(record: FinanceRecord) {
  return `${record.title || '未命名'} ${record.amount}`;
}

function appendRecordLog(state: FinanceState, actor: AuthUserName, action: string, record: FinanceRecord) {
  state.logs.unshift(createOperationLog({
    actor,
    action,
    target: 'record',
    detail: getRecordLogDetail(record),
    recordId: record.id,
    recordMonth: record.month,
  }));
}

async function requireAuth(ctx: Koa.ParameterizedContext, next: Koa.Next) {
  if (!ctx.path.startsWith('/api')) {
    await next();
    return;
  }

  if (ctx.path === '/api/health' || ctx.path === '/api/auth/login') {
    await next();
    return;
  }

  const token = getTokenFromHeader(ctx.get('Authorization'));
  const userName = token ? getUserNameByToken(token) : null;
  if (!token || !userName) {
    ctx.status = 401;
    ctx.body = { message: '未登录或登录已失效' };
    return;
  }

  ctx.state.userName = userName;
  ctx.state.token = token;
  await next();
}

router.get('/health', (ctx) => {
  ctx.body = { ok: true };
});

router.post('/auth/login', async (ctx) => {
  const { userName = '', password = '' } = (ctx.request.body ?? {}) as { userName?: string; password?: string };
  const state = await readState();
  const matchedUser = validateCredentials(userName, password);

  if (!matchedUser) {
    ctx.status = 401;
    ctx.body = { message: '用户名或密码错误' };
    return;
  }

  const session = createSession(matchedUser);
  appendLog(state, matchedUser, '登录', 'auth', '登录系统');
  await writeState(state);
  ctx.body = session;
});

router.post('/auth/logout', async (ctx) => {
  const state = await readState();
  const userName = ctx.state.userName as AuthUserName;
  const token = ctx.state.token as string;
  removeSession(token);
  appendLog(state, userName, '退出登录', 'auth', '退出系统');
  await writeState(state);
  ctx.body = { ok: true };
});

router.get('/state', async (ctx) => {
  ctx.body = await readState();
});

router.get('/logs', async (ctx) => {
  ctx.body = (await readState()).logs;
});

router.post('/records', async (ctx) => {
  const state = await readState();
  const record = createRecord(ctx.request.body as FinanceRecordDraft, ctx.state.userName as AuthUserName);
  state.records.unshift(record);
  appendRecordLog(state, ctx.state.userName as AuthUserName, '新增流水', record);
  ctx.status = 201;
  ctx.body = await writeState(state);
});

router.patch('/records/:id', async (ctx) => {
  const state = await readState();
  const updates = ctx.request.body as Partial<FinanceRecord>;
  const record = state.records.find((item) => item.id === ctx.params.id);

  if (!record) {
    ctx.status = 404;
    ctx.body = { message: '财务记录不存在' };
    return;
  }

  Object.assign(record, updates, { updatedAt: new Date().toISOString() });
  appendRecordLog(state, ctx.state.userName as AuthUserName, '编辑流水', record);
  ctx.body = await writeState(state);
});

router.delete('/records/:id', async (ctx) => {
  const state = await readState();
  const record = state.records.find((item) => item.id === ctx.params.id);
  const nextRecords = state.records.filter((item) => item.id !== ctx.params.id);

  if (!record || nextRecords.length === state.records.length) {
    ctx.status = 404;
    ctx.body = { message: '财务记录不存在' };
    return;
  }

  state.records = nextRecords;
  appendRecordLog(state, ctx.state.userName as AuthUserName, '删除流水', record);
  ctx.body = await writeState(state);
});

app.use(bodyParser());
app.use(requireAuth);
app.use(router.routes());
app.use(router.allowedMethods());
app.use(serve(path.resolve(process.cwd(), 'dist')));

app.listen(port, () => {
  console.log(`Finance API is running at http://localhost:${port}`);
});
