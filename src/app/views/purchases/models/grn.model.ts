export interface GrnItemModel {
    poItemId: number;
    poItemPrice: number;
    itemId: number;
    receivedQty: number;
    rejectedQty: number;
    returnedQty: number;
    batchNumber?: string;
    expiryDate?: number;
}

export interface GrnModel {
    id: number;
    supplierId: number;
    supplierName: string;
    grnNumber: string;
    purchaseOrderId: number;
    supplierInvoiceNo?: string;
    status: string;
    items: GrnItemModel[];
    createdAt: Date;
}
