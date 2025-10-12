export const PAYMENT_CREATED_EVENT = 'payment-created';
export type PaymentCreatedEvent = {
  id: number;
  /**
   * @deprecated should use userId instead
   */
  operationFeeId: string;
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
