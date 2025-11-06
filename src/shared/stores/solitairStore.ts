import { create } from 'zustand';
import { type Card, Cards, Suits, initDeck, initHouse, neighbourMap } from '../types/cards';

const shuffle = (array: Card[]) => {
  const newArr = array.slice().flatMap((i) => i);
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr.map((item, index) => {
    const order = index % 3;
    const pile = Math.trunc(index / 3);
    return { ...item, position: { order, pile: `table_${pile}` } };
  });
};

interface SolitairStore {
  tableCards: Card[];
  houseCards: Record<Suits, Card[]>;
  direction: 'asc' | 'desc' | null;
  congrats: boolean;
  start: () => void;
  reshuffle: () => void;
  move: (data: { card: Card; to: string }) => void;
  setCongrats: (data: boolean) => void;
}

export const useSolitair = create<SolitairStore>((set) => ({
  tableCards: [],
  houseCards: initHouse,
  direction: null,
  congrats: false,
  start: () => {
    set({ tableCards: shuffle(initDeck), houseCards: initHouse, direction: null });
  },
  reshuffle: () => {
    set((state) => ({ tableCards: shuffle(state.tableCards) }));
  },
  move: (data: { card: Card; to: string }) => {
    set((state) => {
      let newTable = state.tableCards;
      let newHouse = state.houseCards;
      let direction = state.direction;
      if (data.to.includes('house')) {
        if (!direction) {
          if (![Cards._6, Cards._A].includes(data.card.card)) return state;
          direction = data.card.card === Cards._6 ? 'asc' : 'desc';
        } else if (
          (direction === 'asc' &&
            data.card.card !== Cards._6 &&
            neighbourMap[data.card.card].prev !== state.houseCards[data.card.suit][0].card) ||
          (direction === 'desc' &&
            data.card.card !== Cards._A &&
            neighbourMap[data.card.card].next !== state.houseCards[data.card.suit][0].card)
        )
          return state;
        newTable = state.tableCards.filter((item) => item.id !== data.card.id);
        newHouse = { ...state.houseCards, [data.card.suit]: [data.card, ...state.houseCards[data.card.suit]] };
      } else {
        console.log(data);
        const splitteId = data.to.split('-');
        if (splitteId)
          newTable = state.tableCards.map((item) =>
            item.id === data.card.id ? { ...item, position: { pile: splitteId[0], order: +splitteId[1] } } : item
          );
      }
      return {
        tableCards: newTable,
        houseCards: newHouse,
        direction,
        congrats: newTable.length === 0 ? true : state.congrats,
      };
    });
  },
  setCongrats: (data: boolean) => {
    set({ congrats: data });
  },
}));
