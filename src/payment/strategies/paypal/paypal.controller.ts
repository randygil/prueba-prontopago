import { Controller, Param, Post } from '@nestjs/common';
import { PaypalStrategy } from './paypal.strategy';

@Controller('paypal')
export class PaypalController {
  constructor(private readonly paypalStrategy: PaypalStrategy) {}

  @Post('capture-order/:orderId')
  async captureOrder(@Param('orderId') orderId: string) {
    return this.paypalStrategy.capture(orderId);
  }
}
