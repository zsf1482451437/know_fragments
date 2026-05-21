import type { PlanData } from '../types/plan';

const ENDPOINT = '/api/plan';

async function parseResponse(response: Response): Promise<PlanData> {
  if (!response.ok) {
    throw new Error('计划数据请求失败');
  }

  return response.json() as Promise<PlanData>;
}

export async function fetchPlan(): Promise<PlanData> {
  const response = await fetch(ENDPOINT);
  return parseResponse(response);
}

export async function persistPlan(plan: PlanData): Promise<PlanData> {
  const response = await fetch(ENDPOINT, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(plan)
  });

  return parseResponse(response);
}
