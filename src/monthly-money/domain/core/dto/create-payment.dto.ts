export type CreatePaymentDTO = {
  amount: number;
  paidAt: string;
  note: string;
  operationFeeId: number;
  userId: string;
};
