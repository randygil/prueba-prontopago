import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import {
  PayPalCaptureResponse,
  PayPalCaptureStatus,
  PayPalOrderCreateRequest,
  PayPalOrderResponse,
  PaypalShowOrderDetailsResponse,
  PayPalTokenResponse,
} from './paypal.types';
import config from '../../../config';
import { PaymentStrategy } from '../../payment.strategy';
import { CURRENCY } from '../../payment.types';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentMethod } from '@prisma/client';

@Injectable()
export class PaypalStrategy implements PaymentStrategy {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor(private eventEmitter: EventEmitter2) {
    this.client = axios.create({
      baseURL:
        config.paypalMode === 'sandbox'
          ? 'https://api-m.sandbox.paypal.com'
          : 'https://api-m.paypal.com',

      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private async setAccessToken(): Promise<void> {
    try {
      if (this.accessToken) {
        return;
      }
      const { data } = await axios.post<PayPalTokenResponse>(
        `${this.client.defaults.baseURL}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          auth: {
            username: config.paypalClientId,
            password: config.paypalClientSecret,
          },
        },
      );

      this.accessToken = data.access_token;
      this.client.defaults.headers.Authorization = `Bearer ${data.access_token}`;
    } catch (error) {
      console.error('Error obtaining PayPal token', error);
      throw new HttpException(
        'Error obtaining PayPal token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async pay(amount: number): Promise<PayPalOrderResponse> {
    try {
      await this.setAccessToken();

      const payload: PayPalOrderCreateRequest = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: CURRENCY,
              value: amount.toFixed(2),
            },
          },
        ],
      };

      const { data } = await this.client.post<PayPalOrderResponse>(
        '/v2/checkout/orders',
        payload,
      );

      return data;
    } catch (error) {
      throw new HttpException(
        `Error creating PayPal order: ${(error as any).response?.data?.message || (error as any).message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async capture(orderId: string): Promise<PayPalCaptureResponse> {
    try {
      await this.setAccessToken();

      const { data } = await this.client.post<PayPalCaptureResponse>(
        `/v2/checkout/orders/${orderId}/capture`,
        {},
      );

      if (data.status === PayPalCaptureStatus.COMPLETED) {
        this.eventEmitter.emit('payment.success', {
          paymentId: orderId,
          paymentMethod: PaymentMethod.PAYPAL,
        });
      } else {
        this.eventEmitter.emit('payment.failed', {
          paymentId: orderId,
          paymentMethod: PaymentMethod.PAYPAL,
          errorMessage: data.status,
        });
      }

      return data;
    } catch (error) {
      throw new HttpException(
        `Error capturing PayPal order: ${(error as any).response?.data?.message || (error as any).message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getOrderDetails(
    orderId: string,
  ): Promise<PaypalShowOrderDetailsResponse> {
    try {
      await this.setAccessToken();

      const { data } = await this.client.get<PaypalShowOrderDetailsResponse>(
        `/v2/checkout/orders/${orderId}`,
      );

      return data;
    } catch (error) {
      throw new HttpException(
        `Error getting PayPal order details: ${(error as any).response?.data?.message || (error as any).message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async refund(paymentId: string): Promise<void> {
    try {
      await this.setAccessToken();

      const orderDetails = await this.getOrderDetails(paymentId);

      if (orderDetails.status !== PayPalCaptureStatus.COMPLETED) {
        throw new HttpException(
          'Cannot refund an order that has not been completed',
          HttpStatus.BAD_REQUEST,
        );
      }

      const [purchase_unit] = orderDetails.purchase_units;

      if (!purchase_unit.payments || !purchase_unit.payments.captures) {
        throw new HttpException(
          'Cannot refund an order that has not been captured',
          HttpStatus.BAD_REQUEST,
        );
      }
      const [capture] = purchase_unit.payments.captures;
      const captureId = capture.id;

      const res = await this.client.post(
        `/v2/payments/captures/${captureId}/refund`,
        {},
      );
      return res.data;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        `Error refunding PayPal payment: ${(error as any).response?.data?.message || (error as any).message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
