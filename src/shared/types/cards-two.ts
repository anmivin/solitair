export enum Suits {
  SPADES = 'spades',
  HEARTS = 'hearts',
  CLUBS = 'clubs',
  DIAMONDS = 'diamonds',
}

export enum Cards {
  '_6' = '6',
  '_7' = '7',
  '_8' = '8',
  '_9' = '9',
  '_10' = '10',
  '_J' = 'jack',
  '_Q' = 'queen',
  '_K' = 'king',
  '_A' = 'ace',
}

export interface Card {
  card: Cards;
  suit: Suits;
  id: string;
  color: 'red' | 'black';
  position?: {
    pile: string;
    order: number;
  };
}

export const initDeck: Card[] = Object.keys(Suits).flatMap((suit) =>
  Object.keys(Cards).map((card) => ({
    card: Cards[card as keyof typeof Cards],
    suit: Suits[suit as keyof typeof Suits],
    id: `${Cards[card as keyof typeof Cards]}_${Suits[suit as keyof typeof Suits]}`,
    color: [Suits.CLUBS, Suits.SPADES].includes(Suits[suit as keyof typeof Suits]) ? 'black' : 'red',
  }))
);

export const initHouse = {
  house_1: null,
  house_2: null,
  house_3: null,
  house_4: null,
};

export const neighbourMap: Record<Cards, { next?: Cards; prev?: Cards }> = {
  [Cards._6]: { next: Cards._7 },
  [Cards._7]: { next: Cards._8, prev: Cards._6 },
  [Cards._8]: { next: Cards._9, prev: Cards._7 },
  [Cards._9]: { next: Cards._10, prev: Cards._8 },
  [Cards._10]: { next: Cards._J, prev: Cards._9 },
  [Cards._J]: { next: Cards._Q, prev: Cards._10 },
  [Cards._Q]: { next: Cards._K, prev: Cards._J },
  [Cards._K]: { next: Cards._A, prev: Cards._Q },
  [Cards._A]: { prev: Cards._K },
};
