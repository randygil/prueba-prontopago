import { Injectable } from '@nestjs/common';
import { PaymentStrategy } from './payment.strategy';
import { PaypalStrategy } from './strategies/paypal/paypal.strategy';
import { PaymentMethod } from '@prisma/client';

@Injectable()
export class PaymentService {
  private strategy: PaymentStrategy | undefined;

  constructor(private paypalStrategy: PaypalStrategy) {}

  setStrategy(strategy: PaymentMethod) {
    switch (strategy) {
      case PaymentMethod.PAYPAL:
        this.strategy = this.paypalStrategy;
        break;
      default:
        throw new Error('Invalid payment strategy');
    }
  }

  async pay(amount: number): Promise<Record<string, any> | void> {
    if (!this.strategy) {
      throw new Error('Payment strategy not set');
    }
    return await this.strategy.pay(amount);
  }

  async refund(paymentId: string): Promise<Record<string, any> | void> {
    if (!this.strategy) {
      throw new Error('Payment strategy not set');
    }
    if (!this.strategy.refund) {
      throw new Error('Refund not supported by this payment strategy');
    }
    return await this.strategy.refund(paymentId);
  }
}
