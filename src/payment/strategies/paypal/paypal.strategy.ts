import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import {
  PayPalCaptureResponse,
  PayPalCaptureStatus,
  PayPalOrderCreateRequest,
  PayPalOrderResponse,
  PayPalOrderStatus,
  PayPalTokenResponse,
} from './paypal.types';
import config from '../../../config';
import { PaymentStrategy } from '../../payment.strategy';
import { CURRENCY } from '../../payment.types';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PaypalStrategy implements PaymentStrategy {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor(private eventEmitter: EventEmitter2) {
    this.client = axios.create({
      baseURL:
        config.paypalMode === 'sandbox'
          ? 'https://api.sandbox.paypal.com'
          : 'https://api.paypal.com',

      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private async setAccessToken(): Promise<void> {
    try {
      const auth = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
      ).toString('base64');

      const { data } = await axios.post<PayPalTokenResponse>(
        `${this.client.defaults.baseURL}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      this.client.defaults.headers.Authorization = `Bearer ${data.access_token}`;
    } catch (error) {
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
}
