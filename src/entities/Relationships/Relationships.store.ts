import { makeAutoObservable } from 'mobx';
import { singleton } from 'tsyringe';

export type RelationshipSnapshot = Record<string, number>;

type ToneVariants = {
  positive: string;
  neutral: string;
  negative: string;
};

type GreetingDictionary = Record<string, ToneVariants>;

const DEFAULT_RELATIONS: RelationshipSnapshot = {
  caretaker_borin: 0,
  caretaker_thera: 0,
  caretaker_lena: 0,
  caretaker_allen: 0,
  caretaker_ellia: 0,
  caretaker_sorvik: 0,
  caretaker_karen: 0,
  caretaker_kaia: 0,
  caretaker_galvin: 0,
  caretaker_shade: 0,
  leader_lisandra: 0,
  leader_arina: 0,
  leader_verena: 0,
  leader_kassandra: 0,
  leader_mirella: 0,
};

const FALLBACK_GREETING: ToneVariants = {
  positive: 'Рады вас видеть.',
  neutral: 'Приветствую.',
  negative: 'Не думал увидеть вас снова.',
};

const GREETINGS: GreetingDictionary = {
  caretaker_borin: {
    positive: 'Даже горн краснеет, когда ты заходишь. Что разогреем вместе?',
    neutral: 'Глава, горны гудят как положено. Что нужно поправить?',
    negative: 'Без заказа и с пустыми руками? Не мешай работать.',
  },
  caretaker_thera: {
    positive: 'Снова ты, Фин. Может, я перевяжу тебя просто так, ради удовольствия?',
    neutral: 'Глава, пациенты ждут, решай куда направить ресурсы.',
    negative: 'Если опять пришёл ломать порядок, дверь за тобой.',
  },
  caretaker_lena: {
    positive: 'Комнаты сияют, но ты выглядишь ещё лучше. Присядешь — расскажу последние новости.',
    neutral: 'Жилые кварталы держатся. Решим, кого расселять.',
    negative: 'Опоздал, как всегда. Люди спят в коридоре — доволен?',
  },
  caretaker_allen: {
    positive: 'Отряды в строю, а я весь во внимании к тебе. Поиграем с маршрутами?',
    neutral: 'Команды на связи, жду распоряжений.',
    negative: 'Если снова пришёл без плана, не задерживай диспетчерскую.',
  },
  caretaker_ellia: {
    positive: 'Интендант Эллия к твоим услугам. Хочешь, покажу сердце гильдии только для нас двоих?',
    neutral: 'Отчёты и заявки отсортированы. Жду твоих решений.',
    negative: 'Ты опять всё свалил на меня и смылся? Исправляй сейчас же.',
  },
  caretaker_sorvik: {
    positive: 'Твои подписи выглядят особенно привлекательно сегодня. Поправим бюджет за одним столиком?',
    neutral: 'Книги сходятся, готов обсудить цифры.',
    negative: 'Без твёрдых решений твоё лицо мне не к чему. Возвращайся с планом.',
  },
  caretaker_karen: {
    positive: 'Карэн лучится улыбкой: «Глава, сыграем правильно — устрою тебе личный банкет.»',
    neutral: 'Карэн кивает: «Документы готовы, с чего начнём?»',
    negative: 'Карэн хмурится: «Пришёл без подарков снова? Тогда говори быстро.»',
  },
  caretaker_kaia: {
    positive: 'Кайя усмехается: «Люблю, когда ты появляешься без предупреждения. Обменяемся самыми горячими слухами?»',
    neutral: 'Кайя кивает: «Донесения свежие, разберёмся?»',
    negative: 'Кайя криво усмехается: «Не порть воздух, если пришёл без толку.»',
  },
  caretaker_galvin: {
    positive: 'Гальвин проводит взглядом: «Хочешь, покажу приватную тренировку для особо доверенных?»',
    neutral: 'Гальвин рапортует: «Рекруты ждут решений, глава.»',
    negative: 'Гальвин бурчит: «Пока ты мямлишь, люди разбегаются.»',
  },
  caretaker_shade: {
    positive: 'Шейд улыбается уголком губ: «Для тебя всегда найдётся тайный проход.»',
    neutral: 'Шейд шепчет: «Сеть слушает. Что нужно?»',
    negative: 'Шейд цедит: «Если снова пришёл без выкупа, исчезни.»',
  },
  leader_lisandra: {
    positive: 'Лисандра кивает с явным удовлетворением: «Гильдия действует образцово.»',
    neutral: 'Лисандра смотрит пристально: «Оцениваю результаты.»',
    negative: 'Лисандра скрещивает руки: «Мне трудно доверять тебе, глава.»',
  },
  leader_arina: {
    positive: 'Арина приветствует тебя воинским жестом: «Рада видеть надёжного союзника.»',
    neutral: 'Арина коротко кивает: «Есть вопросы по безопасности.»',
    negative: 'Арина хмурится: «Стража не любит тех, кто играет на два фронта.»',
  },
  leader_verena: {
    positive: 'Верена улыбается: «Ваши сделки приносят Лиге блестящие результаты.»',
    neutral: 'Верена оценивающе смотрит: «Поговорим о новых возможностях.»',
    negative: 'Верена холодна: «Лига не терпит тех, кто подводит её интересы.»',
  },
  leader_kassandra: {
    positive: 'Кассандра шепчет: «Тени довольны. Продолжим это сотрудничество.»',
    neutral: 'Кассандра наклоняет голову: «Присаживайся, обсудим дела.»',
    negative: 'Кассандра прищуривается: «Я не привыкла прощать ошибки, глава.»',
  },
  leader_mirella: {
    positive: 'Мирелла тепло улыбается: «Жители благодарят тебя искренне.»',
    neutral: 'Мирелла складывает руки: «Народ ждёт очередных шагов.»',
    negative: 'Мирелла качает головой: «Люди разочарованы твоими решениями.»',
  },
};

const FALLBACK_TONE_VARIANTS: ToneVariants = {
  positive: 'Мне нравится, как всё складывается.',
  neutral: 'Посмотрим, что получится.',
  negative: 'Не заставляй меня пожалеть об этом.',
};

const POSITIVE_THRESHOLD = 40;
const NEGATIVE_THRESHOLD = -40;

type RelationshipTier = 'positive' | 'neutral' | 'negative';

@singleton()
export class RelationshipsStore {
  private relations: RelationshipSnapshot = { ...DEFAULT_RELATIONS };
  private syncing = false;

  constructor() {
    makeAutoObservable(this);
  }

  getRelationship = (characterId: string): number => {
    this.ensureCharacter(characterId);

    return this.relations[characterId] ?? 0;
  };

  changeRelationship = (characterId: string, delta: number) => {
    if (!delta) return;
    if (this.syncing) return;
    this.ensureCharacter(characterId);

    const next = this.relations[characterId] + delta;
    this.relations[characterId] = Math.max(-100, Math.min(100, next));
  };

  setRelationship = (characterId: string, value: number) => {
    if (this.syncing) return;
    this.ensureCharacter(characterId);
    this.relations[characterId] = Math.max(-100, Math.min(100, Math.round(value)));
  };

  getGreeting = (characterId: string): string => {
    const set = GREETINGS[characterId] ?? FALLBACK_GREETING;
    const tone = this.getTier(characterId);

    return set[tone];
  };

  renderTone = (characterId: string, variants: ToneVariants): string => {
    const tone = this.getTier(characterId);
    const fallback = FALLBACK_TONE_VARIANTS[tone];
    const option = variants[tone] || variants.neutral || fallback;

    return option;
  };

  applyPlaceholders = (text?: string | null): string | undefined => {
    if (!text) return text ?? undefined;

    let rendered = text;

    rendered = rendered.replace(/{{\s*greeting:([\w_-]+)\s*}}/g, (_, characterId: string) => {
      return this.getGreeting(characterId.trim());
    });

    rendered = rendered.replace(
      /{{\s*tone:([\w_-]+)\|([^|}]*)\|([^|}]*)\|([^}]*)\s*}}/g,
      (_, characterId: string, positive: string, neutral: string, negative: string) => {
        return this.renderTone(characterId.trim(), {
          positive: positive.trim(),
          neutral: neutral.trim(),
          negative: negative.trim(),
        });
      },
    );

    return rendered;
  };

  getSnapshot = (): RelationshipSnapshot => {
    return { ...this.relations };
  };

  loadSnapshot = (snapshot: RelationshipSnapshot | null | undefined) => {
    if (!snapshot) return;
    this.setSyncing(true);

    try {
      const merged: RelationshipSnapshot = { ...DEFAULT_RELATIONS };
      Object.entries(snapshot).forEach(([id, value]) => {
        merged[id] = Math.max(-100, Math.min(100, Math.round(value)));
      });

      this.relations = merged;
    } finally {
      this.setSyncing(false);
    }
  };

  setSyncing(value: boolean) {
    this.syncing = value;
  }

  private getTier = (characterId: string): RelationshipTier => {
    const value = this.getRelationship(characterId);
    if (value >= POSITIVE_THRESHOLD) return 'positive';
    if (value <= NEGATIVE_THRESHOLD) return 'negative';

    return 'neutral';
  };

  private ensureCharacter = (characterId: string) => {
    if (!(characterId in this.relations)) {
      this.relations[characterId] = 0;
    }
  };
}
