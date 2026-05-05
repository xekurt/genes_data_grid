 interface TissueInfo {
  tissueSiteDetailId: string;
  tissueSiteDetail: string;
  colorHex: string;
}

 interface ExpressionData {
  [ensemblId: string]: number;
}

 interface GTExTissueResponse {
  data: {
    tissueSiteDetailId: string;
    tissueSiteDetail: string;
    colorHex: string;
  }[];
}

 interface GTExMedianExpressionEntry {
  gencodeId: string;
  median: number;
}

 interface GTExMedianExpressionResponse {
  data: GTExMedianExpressionEntry[];
}

 interface GTExGeneEntry {
  gencodeId: string;
}

 interface GTExGeneResponse {
  data: GTExGeneEntry[];
}

export type { TissueInfo, ExpressionData, GTExTissueResponse, GTExMedianExpressionResponse, GTExGeneResponse };