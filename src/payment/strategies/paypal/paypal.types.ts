export interface PayPalTokenResponse {
  scope: string;
  access_token: string;
  token_type: string;
  app_id: string;
  expires_in: number;
}

export interface PayPalOrderCreateRequest {
  intent: 'CAPTURE' | 'AUTHORIZE';
  purchase_units: Array<{
    amount: {
      currency_code: string;
      value: string;
    };
    description?: string;
  }>;
}
export enum PayPalOrderStatus {
  CREATED = 'CREATED',
  SAVED = 'SAVED',
  APPROVED = 'APPROVED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface PayPalOrderResponse {
  id: string;
  status: PayPalOrderStatus;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export enum PayPalCaptureStatus {
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING',
  DECLINED = 'DECLINED',
  CANCELLED = 'CANCELLED',
}

export interface PayPalCaptureResponse {
  id: string;
  status: PayPalCaptureStatus;
  purchase_units: Array<{
    payments: {
      captures: Array<{
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
        create_time: string;
      }>;
    };
  }>;
}
