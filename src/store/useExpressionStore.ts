import { create } from 'zustand';
import type { TissueInfo } from '../types/tissue';

interface ExpressionState {
  expressionDataMap: Record<string, Record<string, number>>;
  addedTissues: TissueInfo[];
  setExpressionData: (tissueId: string, data: Record<string, number>) => void;
  addTissue: (tissue: TissueInfo) => void;
  removeTissue: (tissueId: string) => void;
}

export const useExpressionStore = create<ExpressionState>((set) => ({
  expressionDataMap: {},
  addedTissues: [],
  setExpressionData: (tissueId, data) =>
    set((state) => ({
      expressionDataMap: {
        ...state.expressionDataMap,
        [tissueId]: {
          ...(state.expressionDataMap[tissueId] || {}),
          ...data,
        },
      },
    })),
  addTissue: (tissue) =>
    set((state) => ({
      addedTissues: [...state.addedTissues, tissue],
    })),
  removeTissue: (tissueId) =>
    set((state) => {
      const nextMap = { ...state.expressionDataMap };
      delete nextMap[tissueId];
      return {
        addedTissues: state.addedTissues.filter((t) => t.tissueSiteDetailId !== tissueId),
        expressionDataMap: nextMap,
      };
    }),
}));
