export enum PrqStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    CONVERTED = 'CONVERTED'
}


export interface PurchaseRequestItemModel {
    id?: number;
    itemId: number;
    itemName: string;
    requestedQty: number;
    estimatedUnitPrice: number;
    lineTotal?: number;
}

export interface PurchaseRequestModel {
    id: number;
    tenantId?: number;
    vendorId?: number;
    vendorName?: string;
    warehouseId?: string;
    requestedBy: number;
    department: string;
    prqNumber?: string;
    status?: PrqStatus;
    totalEstimatedAmount?: number;
    notes?: string;
    createdAt?: string;
    items: PurchaseRequestItemModel[];
}

export class PurchaseRequestFilterModel {
    id?: number;
    searchQuery?: string
    status?: PrqStatus;
    warehouseId?: number;
    fromDate?: string | null;
    toDate?: string | null;
}