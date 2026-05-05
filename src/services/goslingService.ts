import type { GoslingSpec } from 'gosling.js';
import type { EnrichedGeneRecord } from '../types/csv';

export const generateGeneAnnotationSpec = (gene: EnrichedGeneRecord | null): GoslingSpec | null => {
  if (!gene) return null;

  const chromosomeStr = String(gene.chromosome);
  const chr = chromosomeStr.startsWith('chr') ? chromosomeStr : `chr${chromosomeStr}`;
  
  const seqStart = Number(gene.seq_region_start);
  const seqEnd = Number(gene.seq_region_end);

  
  const padding = Math.max(50000, (seqEnd - seqStart) * 0.5);
  const start = Math.max(0, seqStart - padding);
  const end = seqEnd + padding;

  return {
    title: `Gene Annotation: ${gene.gene_symbol || gene.ensembl}`,
    assembly: 'hg19', // The user's CSV data coordinates are in hg19 (GRCh37)
    layout: 'linear',
    arrangement: 'vertical',
    xDomain: { chromosome: chr, interval: [start, end] },
    views: [
      {
        data: {
          url: 'https://higlass.io/api/v1/tileset_info/?d=OHJakQICQD6gTD7skx4EWA',
          type: 'beddb',
          genomicFields: [
            { index: 1, name: 'start' },
            { index: 2, name: 'end' }
          ],
          valueFields: [
            { index: 5, name: 'strand', type: 'nominal' },
            { index: 3, name: 'name', type: 'nominal' }
          ]
        },
        alignment: 'overlay',
        x: { field: 'start', type: 'genomic' },
        xe: { field: 'end', type: 'genomic' },
        row: { field: 'strand', type: 'nominal' },
        tooltip: [
          { field: 'name', type: 'nominal', alt: 'Gene Name' },
          { field: 'strand', type: 'nominal', alt: 'Strand' }
        ],
        tracks: [
          {
            mark: 'rect',
            color: {
              field: 'strand',
              type: 'nominal',
              domain: ['+', '-'],
              range: ['#0055d4', '#f0445d']
            },
            size: { value: 10 }
          },
          {
            mark: 'text',
            text: { field: 'name', type: 'nominal' },
            color: { value: '#333333' },
            style: { textFontSize: 11, dy: -15 }
          }
        ],
        width: 600,
        height: 120
      }
    ]
  };
};
