import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PaymentService } from './payment.service';
import { PaypalStrategy } from './strategies/paypal/paypal.strategy';

@Module({
  providers: [PrismaService, PaypalStrategy, PaymentService],
  exports: [PaymentService, PaypalStrategy],
})
export class PaymentModule {}
