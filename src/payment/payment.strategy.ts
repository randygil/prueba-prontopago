export interface PaymentStrategy {
  pay(amount: number): Promise<Record<string, any> | void>;

  refund(paymentId: string): Promise<Record<string, any> | void>;
}
