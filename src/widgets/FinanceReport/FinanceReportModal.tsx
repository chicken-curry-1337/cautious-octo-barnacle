import { useMemo } from 'react';

import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';

import { FINANCE_CATEGORY_LABELS } from '../../features/FinanceAnalytics/FinanceAnalytics.store';
import { FinanceAnalyticsStore } from '../../features/FinanceAnalytics/FinanceAnalytics.store';

import styles from './FinanceReportModal.module.css';

type FinanceReportModalProps = {
  isOpen: boolean;
  onClose?: () => void;
};

export const FinanceReportModal = observer(({ isOpen, onClose }: FinanceReportModalProps) => {
  const analyticsStore = useMemo(() => container.resolve(FinanceAnalyticsStore), []);

  if (!isOpen) return null;

  const current = analyticsStore.currentSummary;
  const history = analyticsStore.history;
  const categories = Object.keys(FINANCE_CATEGORY_LABELS) as (keyof typeof FINANCE_CATEGORY_LABELS)[];

  const renderSummaryRow = (summaryLens: (category: keyof typeof FINANCE_CATEGORY_LABELS) => number, title: string, isExpense = false) => (
    <tbody>
      <tr className={styles.sectionHeader}>
        <td colSpan={3}>{title}</td>
      </tr>
      {categories.map((category) => {
        const amount = summaryLens(category);
        if (amount === 0) return null;

        return (
          <tr key={`${title}-${category}`}>
            <td>{FINANCE_CATEGORY_LABELS[category]}</td>
            <td className={styles.amount}>{isExpense ? '-' : '+'}</td>
            <td className={clsx(styles.amount, isExpense ? styles.expense : styles.income)}>
              {amount}
            </td>
          </tr>
        );
      })}
    </tbody>
  );

  const totalIncome = analyticsStore.totalIncome(current);
  const totalExpense = analyticsStore.totalExpense(current);
  const allTimeIncome = categories.reduce((sum, category) => sum + analyticsStore.allTimeIncome[category], 0);
  const allTimeExpense = categories.reduce((sum, category) => sum + analyticsStore.allTimeExpense[category], 0);
  const allTimeNet = allTimeIncome - allTimeExpense;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Финансовый отчёт</h2>
          {onClose && (
            <button type="button" className={styles.closeButton} onClick={onClose}>
              ×
            </button>
          )}
        </div>

        <section className={styles.section}>
          <h3>Текущий месяц — {current.label}</h3>
          <table className={styles.table}>
            {renderSummaryRow(category => current.incomeByCategory[category], 'Доходы')}
            {renderSummaryRow(category => current.expenseByCategory[category], 'Расходы', true)}
            <tfoot>
              <tr>
                <td>Итого доход</td>
                <td colSpan={2} className={styles.amount}>{totalIncome}</td>
              </tr>
              <tr>
                <td>Итого расход</td>
                <td colSpan={2} className={styles.amount}>{totalExpense}</td>
              </tr>
              <tr>
                <td>Баланс</td>
                <td colSpan={2} className={clsx(styles.amount, analyticsStore.currentNet >= 0 ? styles.income : styles.expense)}>
                  {analyticsStore.currentNet}
                </td>
              </tr>
            </tfoot>
          </table>
        </section>

        <section className={styles.section}>
          <h3>Статистика за всё время</h3>
          <div className={styles.summaryRow}>
            <span>Доход:</span>
            <span className={styles.income}>{allTimeIncome}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Расходы:</span>
            <span className={styles.expense}>{allTimeExpense}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Баланс:</span>
            <span className={allTimeNet >= 0 ? styles.income : styles.expense}>
              {allTimeNet >= 0 ? '+' : ''}
              {allTimeNet}
            </span>
          </div>
        </section>

        {history.length > 0 && (
          <section className={styles.section}>
            <h3>История по месяцам</h3>
            <div className={styles.historyList}>
              {history.map((entry) => {
                const income = analyticsStore.totalIncome(entry);
                const expense = analyticsStore.totalExpense(entry);
                const net = income - expense;

                return (
                  <div key={entry.key} className={styles.historyItem}>
                    <div className={styles.historyHeader}>
                      <span>{entry.label}</span>
                      <span className={net >= 0 ? styles.income : styles.expense}>
                        {net >= 0 ? '+' : ''}
                        {net}
                      </span>
                    </div>
                    <div className={styles.historyDetails}>
                      <span>Доход: {income}</span>
                      <span>Расход: {expense}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
});
