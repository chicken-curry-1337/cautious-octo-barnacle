import { makeAutoObservable, reaction } from 'mobx';
import { inject, singleton } from 'tsyringe';

import { TimeStore } from '../../entities/TimeStore/TimeStore';

export type FinanceCategory =
  | 'quest_reward'
  | 'quest_penalty'
  | 'quest_refund'
  | 'salary'
  | 'rent'
  | 'recruitment'
  | 'upgrade'
  | 'loan_in'
  | 'loan_out'
  | 'other';

export const FINANCE_CATEGORY_LABELS: Record<FinanceCategory, string> = {
  quest_reward: 'Награды за задания',
  quest_penalty: 'Потери за провалы',
  quest_refund: 'Возвраты',
  salary: 'Зарплаты',
  recruitment: 'Найм',
  upgrade: 'Улучшения',
  loan_in: 'Получено займов',
  loan_out: 'Погашение займов',
  other: 'Прочее',
};

export type FinanceTransactionType = 'income' | 'expense';

export type MonthlyFinanceSummary = {
  key: string;
  label: string;
  incomeByCategory: Record<FinanceCategory, number>;
  expenseByCategory: Record<FinanceCategory, number>;
};

export type FinanceAnalyticsSnapshot = {
  current: MonthlyFinanceSummary;
  history: MonthlyFinanceSummary[];
  allTimeIncome: Record<FinanceCategory, number>;
  allTimeExpense: Record<FinanceCategory, number>;
};

const createEmptySummary = (key: string, label: string): MonthlyFinanceSummary => {
  const emptyIncome = {} as Record<FinanceCategory, number>;
  const emptyExpense = {} as Record<FinanceCategory, number>;

  (Object.keys(FINANCE_CATEGORY_LABELS) as FinanceCategory[]).forEach((category) => {
    emptyIncome[category] = 0;
    emptyExpense[category] = 0;
  });

  return {
    key,
    label,
    incomeByCategory: emptyIncome,
    expenseByCategory: emptyExpense,
  };
};

@singleton()
export class FinanceAnalyticsStore {
  currentSummary: MonthlyFinanceSummary;
  history: MonthlyFinanceSummary[] = [];
  allTimeIncome: Record<FinanceCategory, number> = {} as Record<FinanceCategory, number>;
  allTimeExpense: Record<FinanceCategory, number> = {} as Record<FinanceCategory, number>;
  private syncing = false;

  constructor(@inject(TimeStore) private timeStore: TimeStore) {
    const { key, label } = this.computeMonthKey();
    this.currentSummary = createEmptySummary(key, label);

    (Object.keys(FINANCE_CATEGORY_LABELS) as FinanceCategory[]).forEach((category) => {
      this.allTimeIncome[category] = 0;
      this.allTimeExpense[category] = 0;
    });

    makeAutoObservable(this);

    reaction(
      () => this.timeStore.monthIndex,
      () => {
        if (this.syncing) return;
        this.rollMonth();
      },
      { fireImmediately: false },
    );
  }

  setSyncing = (value: boolean) => {
    this.syncing = value;
  };

  recordIncome = (category: FinanceCategory, amount: number) => {
    if (amount <= 0) return;

    this.currentSummary.incomeByCategory[category] =
      (this.currentSummary.incomeByCategory[category] ?? 0) + amount;
    this.allTimeIncome[category] = (this.allTimeIncome[category] ?? 0) + amount;
  };

  recordExpense = (category: FinanceCategory, amount: number) => {
    if (amount <= 0) return;

    this.currentSummary.expenseByCategory[category] =
      (this.currentSummary.expenseByCategory[category] ?? 0) + amount;
    this.allTimeExpense[category] = (this.allTimeExpense[category] ?? 0) + amount;
  };

  get currentNet() {
    const income = this.totalIncome(this.currentSummary);
    const expense = this.totalExpense(this.currentSummary);

    return income - expense;
  }

  totalIncome = (summary: MonthlyFinanceSummary) => {
    return (Object.keys(FINANCE_CATEGORY_LABELS) as FinanceCategory[]).reduce((sum, category) => {
      return sum + summary.incomeByCategory[category];
    }, 0);
  };

  totalExpense = (summary: MonthlyFinanceSummary) => {
    return (Object.keys(FINANCE_CATEGORY_LABELS) as FinanceCategory[]).reduce((sum, category) => {
      return sum + summary.expenseByCategory[category];
    }, 0);
  };

  loadSnapshot = (snapshot: FinanceAnalyticsSnapshot) => {
    this.setSyncing(true);

    try {
      this.currentSummary = snapshot.current;
      this.history = snapshot.history ?? [];
      this.allTimeIncome = snapshot.allTimeIncome ?? this.allTimeIncome;
      this.allTimeExpense = snapshot.allTimeExpense ?? this.allTimeExpense;
    } finally {
      this.setSyncing(false);
    }
  };

  buildSnapshot = (): FinanceAnalyticsSnapshot => ({
    current: this.currentSummary,
    history: this.history,
    allTimeIncome: this.allTimeIncome,
    allTimeExpense: this.allTimeExpense,
  });

  private rollMonth = () => {
    const { key, label } = this.computeMonthKey();

    if (this.currentSummary.key !== key) {
      const hasData =
        this.totalIncome(this.currentSummary) > 0 || this.totalExpense(this.currentSummary) > 0;

      if (hasData) {
        this.history = [this.currentSummary, ...this.history];
      }

      this.currentSummary = createEmptySummary(key, label);
    }
  };

  private computeMonthKey = () => {
    const year = this.timeStore.year;
    const monthIndex = this.timeStore.monthIndex;
    const monthName = this.timeStore.monthName;

    return {
      key: `${year}-${String(monthIndex + 1).padStart(2, '0')}`,
      label: `${monthName} ${year}`,
    };
  };
}
