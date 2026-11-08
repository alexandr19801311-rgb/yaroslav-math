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
  }
  
  // Сюда позже добавим: subtraction, multiplication
};
