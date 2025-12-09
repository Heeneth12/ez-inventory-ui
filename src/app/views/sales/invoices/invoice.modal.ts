export interface InvoiceModal {
    id: number;
    invoiceNumber: string;
    salesOrderId: number;
    customerId: number;
    status: string;
    invoiceDate: Date;
    items: InvoiceItemModal[];
    subTotal: number;
    discountAmount: number;
    taxAmount: number;
    grandTotal: number;
    amountPaid: number;
    balance: number;
    remarks: string;
}

export interface InvoiceItemModal {
    id: number;
    invoiceId: number;
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