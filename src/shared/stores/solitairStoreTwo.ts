import { create } from 'zustand';
import { type Card, Cards, Suits, initDeck, initHouse, neighbourMap } from '../types/cards-two';

const initShuffle = (array: Card[]) => {
  const newArr = array.slice().flatMap((i) => i);
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  const table = newArr.splice(0, 16).map((item, index) => {
    const order = index % 4;
    const pile = Math.trunc(index / 4);
    return { ...item, position: { order, pile: `table_${pile}` } };
  });
  const house = newArr.splice(0, 4).map((item, index) => ({ ...item, position: { pile: `house_${index}`, order: 0 } }));
  return { table, house, hands: newArr.map((item) => ({ ...item, position: { pile: `hands`, order: 0 } })) };
};

interface SolitairStore {
  tableCards: Card[];
  houseCards: Card[];
  handsCards: Card[];
  congrats: boolean;
  start: () => void;
  reshuffle: () => void;
  move: (data: { card: Card; to: string }) => void;
  setCongrats: (data: boolean) => void;
}

export const useSolitairTwo = create<SolitairStore>((set) => ({
  tableCards: [],
  houseCards: [],
  handsCards: [],
  congrats: false,
  start: () => {
    const init = initShuffle(initDeck);
    set({ tableCards: init.table, houseCards: init.house, handsCards: init.hands });
  },
  reshuffle: () => {},
  move: (data: { card: Card; to: string }) => {
    set((state) => {
      return {
        tableCards: state.tableCards.filter((item) => item.id !== data.card.id),
        handsCards: state.handsCards.filter((item) => item.id !== data.card.id),
        houseCards: state.houseCards.map((v) =>
          v.position?.pile === data.to ? { ...data.card, position: v.position } : v
        ),
      };
    });
  },
  setCongrats: (data: boolean) => {
    set({ congrats: data });
  },
}));
