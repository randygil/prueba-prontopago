export interface PaymentStrategy {
  pay(amount: number): Promise<Record<string, any> | void>;
}
