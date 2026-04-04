// src/lib/courier/steadfast.ts
// Service layer for interacting with the Steadfast Courier API.
// Documented at: https://portal.packzy.com/api/v1

const BASE_URL = 'https://portal.packzy.com/api/v1';

export interface SteadfastOrder {
  invoice: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number;
  note?: string;
  item_description?: string;
  delivery_type?: number; // 0 = home, 1 = hub
}

export interface SteadfastResponse {
  status: number;
  message: string;
  consignment?: {
    consignment_id: number;
    invoice: string;
    tracking_code: string;
    status: string;
    created_at: string;
  };
}

export const steadfast = {
  getHeaders() {
    return {
      'Api-Key': process.env.STEADFAST_API_KEY || '',
      'Secret-Key': process.env.STEADFAST_SECRET_KEY || '',
      'Content-Type': 'application/json',
    };
  },

  async createOrder(data: SteadfastOrder): Promise<SteadfastResponse> {
    try {
      const response = await fetch(`${BASE_URL}/create_order`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('[Steadfast] createOrder error:', error);
      throw error;
    }
  },

  async getStatusById(id: string | number): Promise<any> {
    try {
      const response = await fetch(`${BASE_URL}/status_by_cid/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('[Steadfast] getStatus error:', error);
      throw error;
    }
  },
  
  async checkFraud(phone: string): Promise<any> {
    try {
      const cleanPhone = phone.replace(/\D/g, '').slice(-11);
      const url = `${BASE_URL}/fraud_check/${cleanPhone}`;
      console.log(`[Steadfast Debug] Sending Fraud Check to: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const text = await response.text();
      console.log(`[Steadfast Debug] Raw Response:`, text);

      try {
        return JSON.parse(text);
      } catch (e) {
        return { status: 500, message: "Response is not valid JSON", raw: text };
      }
    } catch (error: any) {
      console.error('[Steadfast] checkFraud error:', error);
      throw error;
    }
  }
};
