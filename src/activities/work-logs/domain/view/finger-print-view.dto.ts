export type FingerPrintLogViewDTO = {
  deviceUserId: string;
  recordTime: string;
};

export type FingerPrintUserViewDTO = {
  data: FingerPrintUserViewItemDTO[];
};

export type FingerPrintUserViewItemDTO = {
  userId: string;
  name: string;
};
