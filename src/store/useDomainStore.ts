import { create } from 'zustand';
import type { GeneRecord } from '../types/csv';

interface DomainState {
  viewData: GeneRecord[];
  totalCount: number;
  isDataLoading: boolean;
  setViewData: (data: GeneRecord[]) => void;
  setTotalCount: (count: number) => void;
  setIsDataLoading: (isLoading: boolean) => void;
}

export const useDomainStore = create<DomainState>((set) => ({
  viewData: [],
  totalCount: 0,
  isDataLoading: false,
  setViewData: (data) => set({ viewData: data }),
  setTotalCount: (count) => set({ totalCount: count }),
  setIsDataLoading: (isLoading) => set({ isDataLoading: isLoading }),
}));
