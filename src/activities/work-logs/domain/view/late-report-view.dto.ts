export type LateReportViewDTO = LateReportViewItemDTO[];

export type LateReportViewItemDTO = {
  id: string;
  email: string;
  fullName: string;
  lateCount: number;
};
