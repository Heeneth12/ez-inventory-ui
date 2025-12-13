export interface InvoiceModal {
  id: number;
  invoiceNumber: string;
  salesOrderId: number;
  customerId: number;
  warehouseId: number;
  status: string;
  invoiceDate: Date;
  items: InvoiceItemModal[];
  subTotal: number;
  discountAmount: number;
  totalDiscount: number;
  totalTax: number;
  taxAmount: number;
  grandTotal: number;
  amountPaid: number;
  balance: number;
  remarks: string;
}

export interface InvoiceItemModal {
  id: number;
  invoiceId: number;
  soItemId: number;
  itemId: number;
  itemName: string;
  quantity: number;
  batchNumber: string;
  sku: string;
  unitPrice: number;
  discountAmount: number;
  taxAmount: number;
  lineTotal: number;
}

export interface InvoiceItemCreateModal {
  soItemId: number;
  itemId: number;
  quantity: number;
  batchNumber: string;
  unitPrice: number;
}

// --- DTO INTERFACES (Match your Java Backend DTOs) ---
export interface InvoiceRequest {
  id?: number | null;
  salesOrderId: number | null;
  customerId: number;
  warehouseId: number;
  invoiceDate: string;
  remarks: string;
  totalDiscount: number;
  totalTax: number;
  scheduledDate?: string;
  shippingAddress?: string;
  deliveryType?: string;
  items: InvoiceItemRequest[];
}

export interface InvoiceItemRequest {
  id: number | null; // Null for new, Number for update
  soItemId: number | null;
  itemId: number;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxAmount: number;
  batchNumber: string;
}

export class InvoiceFilterModal {
  id?: number | null;
  salesOrderId?: number | null;
  status?: string | null;
  customerId?: number | null;
  warehouseId?: number | null;

}

export enum InvoiceStatus {
  PENDING = 'PENDING',            // Invoice created but not delivered and not paid
  MOVED_TO_DELIVERY = 'MOVED_TO_DELIVERY',  // Invoice moved to delivery
  DELIVERED = 'DELIVERED',          // Delivery completed
  WAITING_PAYMENT = 'WAITING_PAYMENT',    // Waiting for payment after delivery
  PARTIALLY_PAID = 'PARTIALLY_PAID',     // Some payment received
  PAID = 'PAID',               // Fully paid
  CANCELLED = 'CANCELLED'           // Invoice cancelled
}


export type DeliveryOption = 'IN_HOUSE_DELIVERY' | 'THIRD_PARTY_COURIER' | 'CUSTOMER_PICKUP';