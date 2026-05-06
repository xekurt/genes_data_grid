import Dexie, { type EntityTable } from 'dexie';
import type { GeneRecord } from '@/types/csv';

export class GeneDatabase extends Dexie {
  genes!: EntityTable<
    GeneRecord,
    'ensembl' // primary key
  >;

  constructor() {
    super('GeneDatabase');
    this.version(1).stores({
      genes: 'ensembl, gene_symbol, chromosome, biotype' // indexed fields
    });
  }
}

export const db = new GeneDatabase();
