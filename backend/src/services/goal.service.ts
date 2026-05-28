import prisma from '../utils/prisma';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors';

type GoalType = 'FINANCIAL' | 'OTHER';
type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

/**
 * Decora a meta com totais (aportado, % valor, % etapas, % combinado) e
 * detecta atingimento. A regra do progresso combinado:
 *  - Não financeira: 100% só pelas etapas.
 *  - Financeira sem etapas: 100% só pelo valor.
 *  - Financeira com etapas: média entre os dois.
 */
function decorate(goal: any) {
  const stepCount = goal.steps?.length ?? 0;
  const doneCount = goal.steps?.filter((s: any) => s.isDone).length ?? 0;
  const contributed = (goal.contributions ?? []).reduce((s: number, c: any) => s + c.amount, 0);

  const stepsProgress = stepCount > 0 ? (doneCount / stepCount) * 100 : null;
  const valueProgress = goal.type === 'FINANCIAL' && goal.targetValue && goal.targetValue > 0
    ? Math.min(100, (contributed / goal.targetValue) * 100)
    : null;

  let combined = 0;
  if (goal.type === 'FINANCIAL') {
    if (stepsProgress !== null && valueProgress !== null) combined = (valueProgress + stepsProgress) / 2;
    else combined = valueProgress ?? stepsProgress ?? 0;
  } else {
    combined = stepsProgress ?? 0;
  }

  const isReached =
    (goal.type === 'FINANCIAL' && (valueProgress ?? 0) >= 100 && (stepCount === 0 || (stepsProgress ?? 0) >= 100)) ||
    (goal.type === 'OTHER' && stepCount > 0 && (stepsProgress ?? 0) >= 100);

  return {
    ...goal,
    stats: {
      contributed,
      stepCount,
      doneCount,
      stepsProgress,
      valueProgress,
      combined: Math.round(combined),
      isReached,
    },
  };
}

async function tryAutoComplete(goalId: string) {
  const g = await prisma.goal.findUnique({
    where: { id: goalId },
    include: { steps: true, contributions: true },
  });
  if (!g || g.status === 'COMPLETED') return null;
  const dec = decorate(g);
  if (dec.stats.isReached) {
    return prisma.goal.update({
      where: { id: goalId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
  }
  return null;
}

export const goalService = {
  async list(userId: string) {
    const goals = await prisma.goal.findMany({
      where: { userId },
      include: { steps: true, contributions: { orderBy: { date: 'desc' } } },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
    return goals.map(decorate);
  },

  async getById(userId: string, id: string) {
    const goal = await prisma.goal.findUnique({
      where: { id },
      include: {
        steps: { orderBy: { order: 'asc' } },
        contributions: { orderBy: { date: 'desc' } },
      },
    });
    if (!goal) throw new NotFoundError('Goal');
    if (goal.userId !== userId) throw new ForbiddenError();
    return decorate(goal);
  },

  async create(userId: string, data: {
    title: string;
    description?: string;
    type: GoalType;
    targetValue?: number;
    targetDate?: string | null;
    color?: string;
    icon?: string;
    initialSteps?: string[];
  }) {
    if (data.type === 'FINANCIAL' && (!data.targetValue || data.targetValue <= 0)) {
      throw new ValidationError('Meta financeira precisa de valor alvo positivo');
    }
    const goal = await prisma.goal.create({
      data: {
        userId,
        title: data.title,
        description: data.description ?? null,
        type: data.type,
        targetValue: data.type === 'FINANCIAL' ? data.targetValue! : null,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
        color: data.color ?? '#6366f1',
        icon: data.icon ?? 'target',
        steps: data.initialSteps && data.initialSteps.length > 0
          ? { create: data.initialSteps.map((title, i) => ({ title, order: i })) }
          : undefined,
      },
      include: { steps: true, contributions: true },
    });
    return decorate(goal);
  },

  async update(userId: string, id: string, data: any) {
    const goal = await prisma.goal.findUnique({ where: { id } });
    if (!goal) throw new NotFoundError('Goal');
    if (goal.userId !== userId) throw new ForbiddenError();

    const safe: any = {};
    for (const key of ['title', 'description', 'targetValue', 'color', 'icon', 'status']) {
      if (data[key] !== undefined) safe[key] = data[key];
    }
    if (data.targetDate !== undefined) {
      safe.targetDate = data.targetDate ? new Date(data.targetDate) : null;
    }
    if (data.status === 'COMPLETED' && goal.status !== 'COMPLETED') {
      safe.completedAt = new Date();
    } else if (data.status && data.status !== 'COMPLETED' && goal.status === 'COMPLETED') {
      safe.completedAt = null;
    }
    const updated = await prisma.goal.update({
      where: { id },
      data: safe,
      include: { steps: { orderBy: { order: 'asc' } }, contributions: { orderBy: { date: 'desc' } } },
    });
    return decorate(updated);
  },

  async remove(userId: string, id: string) {
    const goal = await prisma.goal.findUnique({ where: { id }, select: { userId: true } });
    if (!goal) throw new NotFoundError('Goal');
    if (goal.userId !== userId) throw new ForbiddenError();
    await prisma.goal.delete({ where: { id } });
  },

  // ── Steps ──
  async addStep(userId: string, goalId: string, title: string) {
    const goal = await prisma.goal.findUnique({ where: { id: goalId }, include: { steps: true } });
    if (!goal) throw new NotFoundError('Goal');
    if (goal.userId !== userId) throw new ForbiddenError();
    const order = goal.steps.length;
    return prisma.goalStep.create({ data: { goalId, title, order } });
  },

  async updateStep(userId: string, goalId: string, stepId: string, data: { title?: string; isDone?: boolean }) {
    const step = await prisma.goalStep.findUnique({ where: { id: stepId }, include: { goal: { select: { userId: true } } } });
    if (!step || step.goalId !== goalId) throw new NotFoundError('Step');
    if (step.goal.userId !== userId) throw new ForbiddenError();

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.isDone !== undefined) {
      updateData.isDone = data.isDone;
      updateData.completedAt = data.isDone ? new Date() : null;
    }
    const updated = await prisma.goalStep.update({ where: { id: stepId }, data: updateData });

    const autoCompleted = await tryAutoComplete(goalId);
    return { step: updated, goalCompleted: !!autoCompleted };
  },

  async removeStep(userId: string, goalId: string, stepId: string) {
    const step = await prisma.goalStep.findUnique({ where: { id: stepId }, include: { goal: { select: { userId: true } } } });
    if (!step || step.goalId !== goalId) throw new NotFoundError('Step');
    if (step.goal.userId !== userId) throw new ForbiddenError();
    await prisma.goalStep.delete({ where: { id: stepId } });
  },

  // ── Contributions ──
  async addContribution(userId: string, goalId: string, data: { amount: number; note?: string; date?: string }) {
    const goal = await prisma.goal.findUnique({ where: { id: goalId }, select: { userId: true, type: true } });
    if (!goal) throw new NotFoundError('Goal');
    if (goal.userId !== userId) throw new ForbiddenError();
    if (goal.type !== 'FINANCIAL') throw new ValidationError('Aportes só em metas financeiras');
    if (!data.amount || data.amount <= 0) throw new ValidationError('Valor deve ser positivo');

    const contribution = await prisma.goalContribution.create({
      data: {
        goalId,
        amount: data.amount,
        note: data.note ?? null,
        date: data.date ? new Date(data.date) : new Date(),
      },
    });
    const autoCompleted = await tryAutoComplete(goalId);
    return { contribution, goalCompleted: !!autoCompleted };
  },

  async removeContribution(userId: string, goalId: string, contribId: string) {
    const c = await prisma.goalContribution.findUnique({
      where: { id: contribId },
      include: { goal: { select: { userId: true } } },
    });
    if (!c || c.goalId !== goalId) throw new NotFoundError('Contribution');
    if (c.goal.userId !== userId) throw new ForbiddenError();
    await prisma.goalContribution.delete({ where: { id: contribId } });
  },
};
