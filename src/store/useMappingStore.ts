import { create } from 'zustand';

interface MappingState {
  ensemblToGencode: Map<string, string>;
  gencodeToEnsembl: Map<string, string>;
  setVersionMapping: (unversioned: string, versioned: string) => void;
  setVersionMappings: (mappings: Record<string, string>) => void;
  clearMappings: () => void;
}

export const useMappingStore = create<MappingState>((set) => ({
  ensemblToGencode: new Map(),
  gencodeToEnsembl: new Map(),
  setVersionMapping: (unversioned, versioned) => set((state) => {
    const nextEnsembl = new Map(state.ensemblToGencode);
    const nextGencode = new Map(state.gencodeToEnsembl);
    nextEnsembl.set(unversioned, versioned);
    nextGencode.set(versioned, unversioned);
    return { ensemblToGencode: nextEnsembl, gencodeToEnsembl: nextGencode };
  }),
  setVersionMappings: (mappings) => set((state) => {
    const nextEnsembl = new Map(state.ensemblToGencode);
    const nextGencode = new Map(state.gencodeToEnsembl);
    Object.entries(mappings).forEach(([u, v]) => {
      nextEnsembl.set(u, v);
      nextGencode.set(v, u);
    });
    return { ensemblToGencode: nextEnsembl, gencodeToEnsembl: nextGencode };
  }),
  clearMappings: () => set({
    ensemblToGencode: new Map(),
    gencodeToEnsembl: new Map(),
  }),
}));
