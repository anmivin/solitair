import { type ReactElement } from 'react';
import Solitair from '../../pages/Solitair';
import SolitairTwo from '../../pages/Solitair-two';
import Pattern from '../../pages/Pattern';
export const Paths = {
  books: '/books',
  wisdoms: '/wisdoms',
  exile: '/exile',
  solitair: '/solitair',
  solitairtwo: 'solitair-two',
  pattern: '/pattern',
} as const;

export interface RoutesProps {
  link: string;
  Component: () => ReactElement;
  name: string;
}

export const menuRoutes: RoutesProps[] = [
  {
    link: Paths.solitair,
    Component: Solitair,
    name: 'Пасьянс',
  },
  {
    link: Paths.pattern,
    Component: Pattern,
    name: 'Схема',
  },
  /*   {
    link: Paths.solitairtwo,
    Component: SolitairTwo,
    name: 'Пасьянс2',
  }, */
];
