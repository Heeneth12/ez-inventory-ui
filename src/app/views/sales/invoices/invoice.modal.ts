import { CommonFilterModel } from "../../../layouts/models/common-filter.model";
import { ContactMiniModel } from "../../contacts/contacts.model";

export class InvoiceModal {
  id!: number;
  invoiceNumber!: string;
  tenantId!: number;
  salesOrderId!: number | null;
  salesOrderNumber?: string;
  warehouseId!: number;
  customerId!: number;
  contactMini!: ContactMiniModel;
  invoiceDate!: string;
  status!: string;
  deliveryStatus!: string;
  paymentStatus!: string;
  invoiceType!: string;
  remarks!: string;
  itemGrossTotal?: number;
  itemTotalDiscount?: number;
  itemTotalTax?: number;
  flatDiscountRate!: number;
  flatDiscountAmount?: number;
  flatTaxRate!: number;
  flatTaxAmount?: number;
  grandTotal?: number;
  amountPaid?: number;
  balance?: number;
  scheduledDate?: string;
  shippingAddress?: string;
  deliveryType?: string;
  items!: InvoiceItemModal[];
}

export class InvoiceItemModal {
  id?: number | null;
  invoiceId?: number;
  soItemId?: number | null;
  itemId!: number;
  itemName?: string;
  sku?: string;
  batchNumber?: string;
  returnedQuantity?: number;
  quantity!: number;
  unitPrice!: number;
  discountRate!: number;
  discountAmount?: number;
  taxRate!: number;
  taxAmount?: number;
  lineTotal?: number;
}

export class InvoiceFilterModal extends CommonFilterModel {
  customerId?: number | null;
  salesOrderId?: number | null;
  invStatuses?: InvoiceStatus[] | null;
  paymentStatus?: InvoicePaymentStatus[] | null;
}

export enum InvoiceStatus {
  PENDING = 'PENDING',
  MOVED_TO_DELIVERY = 'MOVED_TO_DELIVERY',
  DELIVERED = 'DELIVERED',
  WAITING_PAYMENT = 'WAITING_PAYMENT',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export enum InvoicePaymentStatus {
  UNPAID = 'UNPAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID'
}

export type DeliveryOption = 'IN_HOUSE_DELIVERY' | 'THIRD_PARTY_COURIER' | 'CUSTOMER_PICKUP';