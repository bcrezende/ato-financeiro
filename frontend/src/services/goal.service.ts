import api from './api';

export interface GoalStep {
  id: string;
  goalId: string;
  title: string;
  isDone: boolean;
  completedAt: string | null;
  order: number;
  createdAt: string;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number;
  note: string | null;
  date: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  type: 'FINANCIAL' | 'OTHER';
  targetValue: number | null;
  targetDate: string | null;
  color: string;
  icon: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  steps: GoalStep[];
  contributions: GoalContribution[];
  stats: {
    contributed: number;
    stepCount: number;
    doneCount: number;
    stepsProgress: number | null;
    valueProgress: number | null;
    combined: number;
    isReached: boolean;
  };
}

export const goalService = {
  list: () => api.get('/goals').then((r) => r.data.data as Goal[]),
  getById: (id: string) => api.get(`/goals/${id}`).then((r) => r.data.data as Goal),
  create: (data: any) => api.post('/goals', data).then((r) => r.data.data as Goal),
  update: (id: string, data: any) => api.put(`/goals/${id}`, data).then((r) => r.data.data as Goal),
  remove: (id: string) => api.delete(`/goals/${id}`),

  addStep: (goalId: string, title: string) =>
    api.post(`/goals/${goalId}/steps`, { title }).then((r) => r.data.data as GoalStep),
  updateStep: (goalId: string, stepId: string, data: { title?: string; isDone?: boolean }) =>
    api.patch(`/goals/${goalId}/steps/${stepId}`, data).then((r) => r.data.data as { step: GoalStep; goalCompleted: boolean }),
  removeStep: (goalId: string, stepId: string) =>
    api.delete(`/goals/${goalId}/steps/${stepId}`),

  addContribution: (goalId: string, data: { amount: number; note?: string; date?: string }) =>
    api.post(`/goals/${goalId}/contributions`, data).then((r) => r.data.data as { contribution: GoalContribution; goalCompleted: boolean }),
  removeContribution: (goalId: string, contribId: string) =>
    api.delete(`/goals/${goalId}/contributions/${contribId}`),
};
