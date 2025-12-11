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