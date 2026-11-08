// ============================================================
// TASKS.JS — Данные всех тем платформы
// ============================================================

export const THEMES = {
  composition: {
    id: 'composition',
    title: 'Состав чисел',
    emoji: '🏠',
    description: 'Собери число из двух слагаемых',
    ageRange: '6-8 лет',
    levels: [
      { id: 'easy',   title: 'Числа 2-5',   numbers: [2,3,4,5] },
      { id: 'medium', title: 'Числа 6-8',   numbers: [6,7,8] },
      { id: 'hard',   title: 'Числа 9-10',  numbers: [9,10] },
      { id: 'all',    title: 'Все числа 2-10', numbers: [2,3,4,5,6,7,8,9,10] }
    ],
    generateVariants: (num) => {
      const variants = [];
      for (let a = 0; a <= num; a++) variants.push([a, num - a]);
      return variants;
    }
  },

  // НОВАЯ ТЕМА: ВЫЧИТАНИЕ
  subtraction: {
    id: 'subtraction',
    title: 'Вычитание',
    emoji: '➖',
    description: 'Найди разность чисел',
    ageRange: '7-9 лет',
    levels: [
      { id: 'easy',   title: 'Результат 2-5',   numbers: [2,3,4,5] },
      { id: 'hard',   title: 'Результат 6-10',  numbers: [6,7,8,9,10] },
      { id: 'all',    title: 'Все результаты',  numbers: [2,3,4,5,6,7,8,9,10] }
    ],
    generateVariants: (num) => {
      // num — это РЕЗУЛЬТАТ вычитания.
      // Ищем пары (a, b), где a - b = num, при этом b >= 1 и a <= 10.
      const variants = [];
      for (let b = 1; b <= 9; b++) {
        const a = num + b;
        if (a <= 10) {
          variants.push([a, b]); // [уменьшаемое, вычитаемое]
        }
      }
      return variants;
    }
  }
};
