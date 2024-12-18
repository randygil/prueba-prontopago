import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PaymentService } from './payment.service';
import { PaypalStrategy } from './strategies/paypal/paypal.strategy';
import { PaypalController } from './strategies/paypal/paypal.controller';

@Module({
  providers: [PrismaService, PaypalStrategy, PaymentService],
  exports: [PaymentService, PaypalStrategy],
  controllers: [PaypalController],
})
export class PaymentModule {}
