export interface PurchaseOrderItemModel {
    id: number;
    itemId: number;
    itemName: String
    orderedQty: number;
    unitPrice: number;
}

export interface PurchaseOrderModel {
    id: number;
    orderNumber: number;
    supplierId: number;
    supplierName: string;
    warehouseId: number;
    expectedDeliveryDate: number;
    status: string;
    notes?: string;
    totalAmount: number;
    items: PurchaseOrderItemModel[];
}