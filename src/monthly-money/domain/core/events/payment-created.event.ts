export const PAYMENT_CREATED_EVENT = 'payment-created';
export type PaymentCreatedEvent = {
  id: number;
  operationFeeId: number;
  amount: number;
  note: string;
  paidAt: string;
  userId: string;
  monthlyConfig: {
    id: number;
    amount: number;
    monthRange: number;
  };
};
