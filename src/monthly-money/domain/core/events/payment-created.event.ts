export const PAYMENT_CREATED_EVENT = 'payment-created';
export type PaymentCreatedEvent = {
  id: number;
  amount: number;
  monthlyConfigId: number;
  note: string;
  paidAt: string;
  userId: string;
};
