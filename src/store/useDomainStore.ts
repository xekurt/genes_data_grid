import { create } from 'zustand';
import type { GeneRecord } from '../types/csv';

interface DomainState {
  geneData: GeneRecord[];
  geneMap: Map<string, GeneRecord>;
  isDataLoading: boolean;
  setGeneData: (data: GeneRecord[]) => void;
  setIsDataLoading: (isLoading: boolean) => void;
}

export const useDomainStore = create<DomainState>((set) => ({
  geneData: [],
  geneMap: new Map(),
  isDataLoading: false,
  setGeneData: (data) => set({ 
    geneData: data,
    geneMap: new Map(data.map(g => [g.ensembl, g]))
  }),
  setIsDataLoading: (isLoading) => set({ isDataLoading: isLoading }),
}));
