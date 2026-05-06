import { create } from 'zustand';

interface CacheState {
  ensemblToGencode: Map<string, string>;
  gencodeToEnsembl: Map<string, string>;
  expressionCache: Map<string, number | null>;
  setVersionMapping: (unversioned: string, versioned: string) => void;
  setExpressionCache: (key: string, value: number | null) => void;
  clearCache: () => void;
}

export const useCacheStore = create<CacheState>((set) => ({
  ensemblToGencode: new Map(),
  gencodeToEnsembl: new Map(),
  expressionCache: new Map(),
  setVersionMapping: (unversioned, versioned) => set((state) => {
    const nextEnsembl = new Map(state.ensemblToGencode);
    const nextGencode = new Map(state.gencodeToEnsembl);
    nextEnsembl.set(unversioned, versioned);
    nextGencode.set(versioned, unversioned);
    return { ensemblToGencode: nextEnsembl, gencodeToEnsembl: nextGencode };
  }),
  setExpressionCache: (key, value) => set((state) => {
    const nextCache = new Map(state.expressionCache);
    nextCache.set(key, value);
    return { expressionCache: nextCache };
  }),
  clearCache: () => set({
    ensemblToGencode: new Map(),
    gencodeToEnsembl: new Map(),
    expressionCache: new Map(),
  }),
}));
