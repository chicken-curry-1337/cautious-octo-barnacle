import { makeAutoObservable } from 'mobx';
import { inject, singleton } from 'tsyringe';

import { DialogueStore } from '../Dialogue/Dialogue.store';

@singleton()
export class TimeStore {
  absoluteDay = 0; // общее количество дней с начала игры
  yearStart = 2025;

  monthNames = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ];

  constructor(@inject(DialogueStore) public dialogueStore: DialogueStore) {
    makeAutoObservable(this);
  }

  get year() {
    let y = this.yearStart;
    let daysLeft = this.absoluteDay;

    while (true) {
      const yearDays = this.isLeapYear(y) ? 366 : 365;

      if (daysLeft >= yearDays) {
        daysLeft -= yearDays;
        y++;
      } else {
        break;
      }
    }

    return y;
  }

  get monthIndex() {
    let daysLeft = this.dayOfYear - 1;
    const daysInMonths = this.daysInMonthsForYear(this.year);

    for (let m = 0; m < daysInMonths.length; m++) {
      if (daysLeft < daysInMonths[m]) {
        return m;
      }
      daysLeft -= daysInMonths[m];
    }

    return 0;
  }

  get monthName() {
    return this.monthNames[this.monthIndex];
  }

  get dayOfMonth() {
    let daysLeft = this.dayOfYear - 1;
    const daysInMonths = this.daysInMonthsForYear(this.year);

    for (let m = 0; m < daysInMonths.length; m++) {
      if (daysLeft < daysInMonths[m]) {
        return daysLeft + 1;
      }
      daysLeft -= daysInMonths[m];
    }

    return 1;
  }

  get dayOfYear() {
    let daysLeft = this.absoluteDay;
    let y = this.yearStart;

    while (true) {
      const yearDays = this.isLeapYear(y) ? 366 : 365;

      if (daysLeft >= yearDays) {
        daysLeft -= yearDays;
        y++;
      } else {
        break;
      }
    }

    return daysLeft + 1;
  }

  nextDay = () => {
    this.absoluteDay++;
  };

  isLeapYear(year: number) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  daysInMonthsForYear(year: number) {
    return [
      31,
      this.isLeapYear(year) ? 29 : 28,
      31,
      30,
      31,
      30,
      31,
      31,
      30,
      31,
      30,
      31,
    ];
  }

  formatDate() {
    return `${this.dayOfMonth} ${this.monthName} ${this.year}`;
  }
}
