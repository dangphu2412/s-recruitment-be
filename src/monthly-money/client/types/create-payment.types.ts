export type CreatePaymentCommand = {
  amount: number;
  paidAt: string;
  note: string;
  userId: string;
};
