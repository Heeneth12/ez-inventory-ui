export interface PurchaseReturnItemModel {
    itemId: number;
    returnQty: number;
    batchNumber?: string;
    refundPrice: number;
}

export interface PurchaseReturnModel {
    supplierId: number;
    warehouseId: number;
    goodsReceiptId?: number;
    reason: string;
    items: PurchaseReturnItemModel[];
}
