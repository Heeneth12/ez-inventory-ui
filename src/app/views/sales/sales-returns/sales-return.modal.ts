import { CommonFilterModel } from "../../../layouts/models/common-filter.model";

export interface SalesReturnModal {
    id: number;
    tenantId: number;
    returnNumber: string;
    invoiceId: number;
    returnDate: string;
    totalAmount: number;
    status?: string;
    paymentMethod?: string;
    allocatedAmount?: number;
    unallocatedAmount?: number;
    items: SalesReturnItemModal[];
    creditNotePaymentId?: number; // Nullable
}

export interface SalesReturnItemModal {
    id: number;
    itemId: number;
    quantity: number;
    unitPrice: number;
    reason: string;
}

export interface SalesReturnRequestModal {
    invoiceId: number;
    reason: string;
    items: ReturnItemRequestModal[];
}
export interface ReturnItemRequestModal {
    itemId: number;
    quantity: number;
}

export class SalesReturnFilter extends CommonFilterModel {
    customerId?: number;
    invoiceId?: number;
    returnNumber?: string;
}