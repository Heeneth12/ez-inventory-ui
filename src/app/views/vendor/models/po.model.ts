export enum PoStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface PurchaseOrderItemDto {
  id?: number;
  itemId: number;
  itemName: string;
  orderedQty: number;
  unitPrice: number;
  
  // Item Level Inputs
  discount: number;
  tax: number;
  
  // Optional: purely for UI calculation helpers, not always needed in payload
  lineTotal?: number; 
}

export interface PurchaseOrderDto {
  id?: number;
  prqId?: number;
  vendorId: number;
  vendorName?: string;
  warehouseId: number;
  orderNumber?: string;
  
  orderDate?: number;
  expectedDeliveryDate: number;
  status: PoStatus;
  notes?: string;

  // --- INPUTS (User Typed) ---
  flatDiscount: number;
  flatTax: number;

  // --- CALCULATED (System Generated) ---
  totalAmount: number;    // Subtotal (Sum of Line Totals)
  totalDiscount: number;  // Sum(Item Disc) + Flat Disc
  totalTax: number;       // Sum(Item Tax) + Flat Tax
  grandTotal: number;     // Final Payable

  createdAt?: Date;
  items: PurchaseOrderItemDto[];
}