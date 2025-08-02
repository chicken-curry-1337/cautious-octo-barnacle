export enum QuestStatus {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  CompletedSuccess = 'CompletedSuccess',
  CompletedFail = 'CompletedFail',
  FailedDeadline = 'FailedDeadline',
  Cancelled = 'Cancelled', // если понадобится
}

export interface Quest {
  id: string;
  date: number; // день создания квеста
  title: string;
  description: string;
  successResult: string;
  failResult: string;
  deadlineResult: string;
  reward: number;
  assignedHeroIds: string[];
  completed: boolean;
  failed?: boolean;
  deadlineDay: number; // День, до которого нужно выполнить
  requiredStrength: number;
  requiredAgility: number;
  requiredIntelligence: number;
  status: QuestStatus;
  resourcePenalty?: {
    goldLoss?: number;
    injuryChance?: number;
    itemLossChance?: number;
  };
}
