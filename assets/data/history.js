// ============================================================
// HISTORY.JS — Факты о технологиях цивилизации
// ============================================================

export const HISTORY_FACTS = {
  composition: [
    {
      id: 'fingers',
      emoji: '🖐️',
      relatedNumber: 5,
      title: {
        ru: 'Пальцы — первый калькулятор',
        en: 'Fingers — the first calculator'
      },
      text: {
        ru: 'Тысячи лет назад люди считали на пальцах. Слово «пять» во многих языках связано с ладонью. Пальцы — самая древняя «счётная машина».',
        en: 'Thousands of years ago people counted on their fingers. The word "five" in many languages is related to the palm. Fingers are the oldest "counting machine".'
      },
      era: {
        ru: 'Древний мир',
        en: 'Ancient world'
      }
    },
    {
      id: 'abacus',
      emoji: '🧮',
      relatedNumber: 7,
      title: {
        ru: 'Абак — первый компьютер',
        en: 'The abacus — the first computer'
      },
      text: {
        ru: 'Древние греки и римляне использовали дощечку с камешками для счёта. Они называли камешки «calculi» — от этого слова произошло слово «калькулятор».',
        en: 'Ancient Greeks and Romans used a board with pebbles for counting. They called the pebbles "calculi" — this is where the word "calculator" comes from.'
      },
      era: {
        ru: 'Античность',
        en: 'Antiquity'
      }
    },
    {
      id: 'ishango',
      emoji: '🦴',
      relatedNumber: 3,
      title: {
        ru: 'Кость Ишанго',
        en: 'The Ishango bone'
      },
      text: {
        ru: 'Это древнейший «калькулятор» возрастом 20 000 лет. На кости нацарапаны зарубки — учёные считают, что это следы счёта.',
        en: 'This is the oldest "calculator", 20,000 years old. The bone has notches carved on it — scientists believe these are traces of counting.'
      },
      era: {
        ru: 'Каменный век',
        en: 'Stone Age'
      }
    },
    {
      id: 'suanpan',
      emoji: '🧮',
      relatedNumber: 9,
      title: {
        ru: 'Китайские счёты',
        en: 'Chinese suanpan'
      },
      text: {
        ru: 'Китайские счёты «суаньпань» появились более 2 000 лет назад. На них можно было складывать и умножать очень быстро — быстрее, чем на бумаге.',
        en: 'Chinese suanpan abacus appeared over 2,000 years ago. With it, you could add and multiply very fast — faster than on paper.'
      },
      era: {
        ru: 'Древний Китай',
        en: 'Ancient China'
      }
    },
    {
      id: 'napier',
      emoji: '📜',
      relatedNumber: 10,
      title: {
        ru: 'Палочки Непера',
        en: 'Napier\'s bones'
      },
      text: {
        ru: 'В 1617 году шотландец Джон Непер придумал «палочки» для умножения. Это был первый механический способ умножать большие числа.',
        en: 'In 1617, the Scotsman John Napier invented "bones" for multiplication. It was the first mechanical way to multiply large numbers.'
      },
      era: {
        ru: 'Новое время',
        en: 'Modern era'
      }
    }
  ]
};

// Получить случайный факт для темы, привязанный к числу (или любой)
export function getFactForNumber(themeId, number) {
  const facts = HISTORY_FACTS[themeId];
  if (!facts) return null;
  const matching = facts.filter(f => f.relatedNumber === number);
  if (matching.length > 0) {
    return matching[Math.floor(Math.random() * matching.length)];
  }
  return facts[Math.floor(Math.random() * facts.length)];
}

// Получить случайный факт (любой)
export function getRandomFact(themeId) {
  const facts = HISTORY_FACTS[themeId];
  if (!facts) return null;
  return facts[Math.floor(Math.random() * facts.length)];
}
