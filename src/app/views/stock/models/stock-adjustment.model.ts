export interface ItemDetail {
    itemId: number;               // Long itemId
    itemName: string;             // String itemName
    systemQty: number;            // Integer systemQty
    countedQty: number;           // Integer countedQty
    differenceQty: number;        // Integer differenceQty
    reasonType: AdjustmentType;   // AdjustmentType enum
}

export interface StockAdjustmentDetailModel {
    id: number;                   // Long id
    adjustmentNumber: string;     // String adjustmentNumber
    adjustmentDate: Date;         // Date adjustmentDate
    status: AdjustmentStatus;     // AdjustmentStatus enum
    warehouseId: number;          // Long warehouseId
    remarks: string;              // String remarks
    reference: string;            // String reference
    items: ItemDetail[];
}


export interface StockAdjustmentModel {
    id: number;                   // Long id
    adjustmentNumber: string;     // String adjustmentNumber
    adjustmentDate: Date;         // Date adjustmentDate
    status: AdjustmentStatus;     // AdjustmentStatus enum
    warehouseId: number;          // Long warehouseId
    reference: string;            // String reference
    totalItems: number;           // int totalItems
}


export enum AdjustmentType {
    DAMAGE = 'DAMAGE',
    EXPIRED = 'EXPIRED',
    AUDIT_CORRECTION = 'AUDIT_CORRECTION',
    FOUND_EXTRA = 'FOUND_EXTRA',
    LOST = 'LOST'
}

export enum AdjustmentStatus {
    DRAFT = 'DRAFT',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    REJECTED = 'REJECTED',
    PENDING_APPROVAL = 'PENDING_APPROVAL'
}