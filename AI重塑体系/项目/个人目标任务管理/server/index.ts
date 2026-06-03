import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import serve from 'koa-static';
import path from 'node:path';
import { createTask, readState, writeState } from './storage.js';
import type { Task } from './types.js';

const app = new Koa();
const router = new Router({ prefix: '/api' });
const port = Number(process.env.PORT || 4174);

router.get('/health', (ctx) => {
  ctx.body = { ok: true };
});

router.get('/state', async (ctx) => {
  ctx.body = await readState();
});

router.post('/tasks', async (ctx) => {
  const state = await readState();
  const task = createTask(ctx.request.body as Partial<Task>);
  state.tasks.unshift(task);
  ctx.status = 201;
  ctx.body = await writeState(state);
});

router.patch('/tasks/:id', async (ctx) => {
  const state = await readState();
  const updates = ctx.request.body as Partial<Task>;
  const task = state.tasks.find((item) => item.id === ctx.params.id);

  if (!task) {
    ctx.status = 404;
    ctx.body = { message: '任务不存在' };
    return;
  }

  Object.assign(task, updates, { updatedAt: new Date().toISOString() });
  ctx.body = await writeState(state);
});

router.delete('/tasks/:id', async (ctx) => {
  const state = await readState();
  const targetId = ctx.params.id;
  const idsToDelete = new Set<string>([targetId]);

  let expanded = true;
  while (expanded) {
    expanded = false;
    for (const task of state.tasks) {
      if (task.parentId && idsToDelete.has(task.parentId) && !idsToDelete.has(task.id)) {
        idsToDelete.add(task.id);
        expanded = true;
      }
    }
  }

  const nextTasks = state.tasks.filter((item) => !idsToDelete.has(item.id));

  if (nextTasks.length === state.tasks.length) {
    ctx.status = 404;
    ctx.body = { message: '任务不存在' };
    return;
  }

  state.tasks = nextTasks;
  ctx.body = await writeState(state);
});

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());
app.use(serve(path.resolve(process.cwd(), 'dist')));

app.listen(port, () => {
  console.log(`Koa API is running at http://localhost:${port}`);
});
