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
  position?: {
    pile: string;
    order: number;
  };
}

export const initDeck = Object.keys(Suits).flatMap((suit) =>
  Object.keys(Cards).map((card) => ({
    card: Cards[card as keyof typeof Cards],
    suit: Suits[suit as keyof typeof Suits],
    id: `${Cards[card as keyof typeof Cards]}_${Suits[suit as keyof typeof Suits]}`,
  }))
);

export const initHouse = {
  [Suits.CLUBS]: [],
  [Suits.DIAMONDS]: [],
  [Suits.HEARTS]: [],
  [Suits.SPADES]: [],
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

/* export const iconMap: Record<Cards, {[Suits.CLUBS]: ReactNode, [Suits.DIAMONDS]: ReactNode, [Suits.HEARTS]: ReactNode, [Suits.SPADES]: ReactNode}> = {
[Cards._6]: {[Suits.CLUBS]: , [Suits.DIAMONDS]: string, [Suits.HEARTS]: string, [Suits.SPADES]: string},
  [Cards._7]: {[Suits.CLUBS]: string, [Suits.DIAMONDS]: string, [Suits.HEARTS]: string, [Suits.SPADES]: string},
  [Cards._8]:{[Suits.CLUBS]: string, [Suits.DIAMONDS]: string, [Suits.HEARTS]: string, [Suits.SPADES]: string},
  [Cards._9]: {[Suits.CLUBS]: string, [Suits.DIAMONDS]: string, [Suits.HEARTS]: string, [Suits.SPADES]: string},
  [Cards._10]: {[Suits.CLUBS]: string, [Suits.DIAMONDS]: string, [Suits.HEARTS]: string, [Suits.SPADES]: string},
  [Cards._J]:{[Suits.CLUBS]: string, [Suits.DIAMONDS]: string, [Suits.HEARTS]: string, [Suits.SPADES]: string},
  [Cards._Q]: {[Suits.CLUBS]: string, [Suits.DIAMONDS]: string, [Suits.HEARTS]: string, [Suits.SPADES]: string},
  [Cards._K]: {[Suits.CLUBS]: string, [Suits.DIAMONDS]: string, [Suits.HEARTS]: string, [Suits.SPADES]: string},
  [Cards._A]: {[Suits.CLUBS]: string, [Suits.DIAMONDS]: string, [Suits.HEARTS]: string, [Suits.SPADES]: string},
} */
