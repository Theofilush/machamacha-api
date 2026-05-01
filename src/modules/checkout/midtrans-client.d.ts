declare module "midtrans-client" {
  export interface MidtransClientOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  export interface TransactionDetails {
    order_id: string;
    gross_amount: number;
  }

  export interface ItemDetail {
    id: string;
    price: number;
    quantity: number;
    name: string;
  }

  export interface CustomerDetails {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  }

  export interface SnapTransactionParameters {
    transaction_details: TransactionDetails;
    item_details?: ItemDetail[];
    customer_details?: CustomerDetails;
    enabled_payments?: string[];
    callbacks?: {
      finish?: string;
    };
    expiry?: {
      start_time?: string;
      duration?: number;
      unit?: string;
    };
  }

  export interface SnapTransactionResponse {
    token: string;
    redirect_url: string;
  }

  export class Snap {
    constructor(options: MidtransClientOptions);
    createTransaction(parameter: SnapTransactionParameters): Promise<SnapTransactionResponse>;
    createTransactionToken(parameter: SnapTransactionParameters): Promise<string>;
    createTransactionRedirectUrl(parameter: SnapTransactionParameters): Promise<string>;
  }

  export class CoreApi {
    constructor(options: MidtransClientOptions);
    charge(parameter: any): Promise<any>;
    capture(parameter: any): Promise<any>;
    approve(parameter: any): Promise<any>;
    deny(parameter: any): Promise<any>;
    cancel(parameter: any): Promise<any>;
    expire(parameter: any): Promise<any>;
    refund(parameter: any): Promise<any>;
    refundDirect(parameter: any): Promise<any>;
    transactionStatus(transactionId: string): Promise<any>;
    transactionNotification(notificationBody: any): Promise<any>;
  }
}
