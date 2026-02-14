export interface PurchaseReturnItemModel {
    id: number;
    itemId: number;
    returnQty: number;
    batchNumber?: string;
    refundPrice: number;
}

export interface PurchaseReturnModel {
    id: number;
    supplierId: number;
    warehouseId: number;
    prNumber: string;
    goodsReceiptId?: number;
    reason: string;
    items: PurchaseReturnItemModel[];
}
