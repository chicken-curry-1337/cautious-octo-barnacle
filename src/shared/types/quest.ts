export enum QuestStatus {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  CompletedSuccess = 'CompletedSuccess',
  CompletedFail = 'CompletedFail',
  FailedDeadline = 'FailedDeadline',
  Cancelled = 'Cancelled', // если понадобится
}

export interface IQuest {
  id: string;
  title: string;
  description: string;
  reward: number;
  dateCreated: number; // день появления
  assignedHeroIds: string[];
  completed: boolean;
  requiredStrength: number;
  requiredAgility: number;
  requiredIntelligence: number;

  // Дедлайн на принятие квеста
  deadlineAccept: number;

  // Время на выполнение после старта
  executionTime: number; // например, 2 дня
  executionDeadline: number | null; // рассчитывается при старте

  failResult: string;
  deadlineResult: string;
  successResult: string;
  status: QuestStatus;
  timeoutResult: string;
  resourceRewards?: Record<string, number>;
  requiredResources?: Record<string, number>;
  modifiers?: string[];
  isStory?: boolean;
  isIllegal?: boolean;
  resourcePenalty?: {
    goldLoss?: number;
    injuryChance?: number;
    itemLossChance?: number;
  };
}

export type QuestNarrative = Pick<IQuest, 'title' | 'description' | 'failResult' | 'successResult' | 'timeoutResult'>;
