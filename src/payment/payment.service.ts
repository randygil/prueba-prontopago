import { Injectable } from '@nestjs/common';
import { PaymentStrategy } from './payment.strategy';
import { PaymentStrategyType } from './payment.types';
import { PaypalStrategy } from './strategies/paypal/paypal.strategy';

@Injectable()
export class PaymentService {
  private strategy: PaymentStrategy | undefined;

  constructor(private paypalStrategy: PaypalStrategy) {}

  setStrategy(strategy: PaymentStrategyType) {
    switch (strategy) {
      case PaymentStrategyType.PAYPAL:
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
    await this.strategy.pay(amount);
  }
}
