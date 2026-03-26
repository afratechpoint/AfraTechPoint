// types/order.ts
// Shared Order type used across checkout, account, and admin pages.

export type PaymentMethod = "bKash" | "Nagad" | "Rocket";

export type PaymentStatus = "pending" | "confirmed" | "failed";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type Order = {
  id: string;
  userId: string;
  userEmail: string;

  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    variantName?: string;
  }>;

  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    postalCode?: string;
  };

  paymentDetails: {
    method: PaymentMethod;
    senderNumber: string;
    transactionId: string;
    accountUsed?: string; // the store's account number they sent to
  };

  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
};
