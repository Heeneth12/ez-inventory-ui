export interface SalesReturnModal {
    id: number;
    tenantId: number;
    returnNumber: string;
    invoiceId: number;
    returnDate: string;
    totalAmount: number;
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