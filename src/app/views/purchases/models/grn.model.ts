export interface GrnItemModel {
    poItemId: number;
    itemId: number;
    receivedQty: number;
    rejectedQty: number;
    batchNumber?: string;
    expiryDate?: number;
}

export interface GrnRequestModel {
    purchaseOrderId: number;
    supplierInvoiceNo?: string;
    items: GrnItemModel[];
}
