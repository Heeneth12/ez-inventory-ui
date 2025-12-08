export interface GrnItemModel {
    poItemId: number;
    itemId: number;
    receivedQty: number;
    rejectedQty: number;
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
}
