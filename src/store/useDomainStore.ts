import { create } from 'zustand';
import type { GeneRecord } from '../types/csv';

interface DomainState {
  geneData: GeneRecord[];
  isDataLoading: boolean;
  setGeneData: (data: GeneRecord[]) => void;
  setIsDataLoading: (isLoading: boolean) => void;
}

export const useDomainStore = create<DomainState>((set) => ({
  geneData: [],
  isDataLoading: false,
  setGeneData: (data) => set({ geneData: data }),
  setIsDataLoading: (isLoading) => set({ isDataLoading: isLoading }),
}));
