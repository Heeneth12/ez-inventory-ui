export interface PurchaseOrderItemModel {
    itemId: number;
    orderedQty: number;
    unitPrice: number;
}

export interface PurchaseOrderModel {
    supplierId: number;
    warehouseId: number;
    expectedDeliveryDate: number;
    notes?: string;
    items: PurchaseOrderItemModel[];
}