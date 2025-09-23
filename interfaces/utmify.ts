// src/interfaces/utmify.ts
export interface UtmifyOrderPayload {
  orderId: string;
  platform: string;
  paymentMethod: string;
  status: "waiting_payment" | "approved" | "refunded";
  createdAt: string;
  approvedDate: string | null;
  refundedAt: string | null;
  customer: {
    name: string;
    email: string;
    phone?: string;
    document?: string;
    country: string;
    ip: string;
  };
  products: {
    id: string;
    name: string;
    planId: string | null;
    planName: string | null;
    quantity: number;
    priceInCents: number;
  }[];
  trackingParameters: {
    src?: string | null;
    sck?: string | null;
    utm_source?: string | null;
    utm_medium?: string | null;
    utm_campaign?: string | null;
    utm_id?: string | null;
    utm_term?: string | null;
    utm_content?: string | null;
  };
  commission: {
    totalPriceInCents: number;
    gatewayFeeInCents: number;
    userCommissionInCents: number;
    currency: string;
  };
  isTest: boolean;
}
