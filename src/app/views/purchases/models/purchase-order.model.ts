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
export class PurchaseOrderFilter {
    id?: number;
    supplierId?: number;
    warehouseId?: number;
    searchQuery?: string;
    status?: PurchaseOrderStatus;
    fromDate?: Date | string | null;
    toDate?: Date | string | null;
}

export enum PurchaseOrderStatus {
    DRAFT = 'DRAFT',
    ISSUED = 'ISSUED',
    PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}