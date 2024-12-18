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

export interface PaypalShowOrderDetailsResponse {
  id: string;
  intent: string;
  status: string;
  payment_source: {
    paypal: {
      email_address: string;
      account_id: string;
      account_status: string;
      name: {
        given_name: string;
        surname: string;
      };
      address: {
        country_code: string;
      };
    };
  };
  purchase_units: Array<{
    reference_id: string;
    amount: {
      currency_code: string;
      value: string;
    };
    payee: {
      email_address: string;
      merchant_id: string;
    };
    shipping: {
      name: {
        full_name: string;
      };
      address: {
        address_line_1: string;
        admin_area_2: string;
        admin_area_1: string;
        postal_code: string;
        country_code: string;
      };
    };
    payments: {
      captures: Array<{
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
        final_capture: boolean;
        seller_protection: {
          status: string;
          dispute_categories: string[];
        };
        seller_receivable_breakdown: {
          gross_amount: {
            currency_code: string;
            value: string;
          };
          paypal_fee: {
            currency_code: string;
            value: string;
          };
          net_amount: {
            currency_code: string;
            value: string;
          };
        };
        links: Array<{
          href: string;
          rel: string;
          method: string;
        }>;
        create_time: string;
        update_time: string;
      }>;
    };
  }>;
  payer: {
    name: {
      given_name: string;
      surname: string;
    };
    email_address: string;
    payer_id: string;
    address: {
      country_code: string;
    };
  };
  create_time: string;
  update_time: string;
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
