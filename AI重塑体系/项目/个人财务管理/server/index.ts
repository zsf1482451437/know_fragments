import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import serve from 'koa-static';
import path from 'node:path';
import { createRecord, readState, writeState } from './storage.js';
import type { FinanceRecord, FinanceRecordDraft } from './types.js';

const app = new Koa();
const router = new Router({ prefix: '/api' });
const port = Number(process.env.PORT || 4176);

router.get('/health', (ctx) => {
  ctx.body = { ok: true };
});

router.get('/state', async (ctx) => {
  ctx.body = await readState();
});

router.post('/records', async (ctx) => {
  const state = await readState();
  const record = createRecord(ctx.request.body as FinanceRecordDraft);
  state.records.unshift(record);
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
  ctx.body = await writeState(state);
});

router.delete('/records/:id', async (ctx) => {
  const state = await readState();
  const nextRecords = state.records.filter((item) => item.id !== ctx.params.id);

  if (nextRecords.length === state.records.length) {
    ctx.status = 404;
    ctx.body = { message: '财务记录不存在' };
    return;
  }

  state.records = nextRecords;
  ctx.body = await writeState(state);
});

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());
app.use(serve(path.resolve(process.cwd(), 'dist')));

app.listen(port, () => {
  console.log(`Finance API is running at http://localhost:${port}`);
});
