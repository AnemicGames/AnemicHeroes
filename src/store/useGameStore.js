import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createUiSlice } from './uiSlice';
import { createPlayerSlice } from './playerSlice';
import { createInventorySlice } from './inventorySlice';
import { createMapSlice } from './mapSlice';
import { createBattleSlice } from './battleSlice';
import { createWorldSlice } from './worldSlice';

export const useGameStore = create(
  persist(
    (set, get) => ({
      ...createUiSlice(set, get),
      ...createPlayerSlice(set, get),
      ...createInventorySlice(set, get),
      ...createMapSlice(set, get),
      ...createBattleSlice(set, get),
      ...createWorldSlice(set, get),
    }),
    {
      name: 'anemic-heroes-store',
    }
  )
);
