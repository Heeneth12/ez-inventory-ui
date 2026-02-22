import { UserMiniModel } from "../../user-management/models/user.model";

export interface PurchaseReturnItemModel {
    id: number;
    itemId: number;
    returnQty: number;
    batchNumber?: string;
    refundPrice: number;
}

export interface PurchaseReturnModel {
    id: number;
    vendorId: number;
    warehouseId: number;
    prNumber: string;
    goodsReceiptId?: number;
    reason: string;
    vendorDetails: UserMiniModel;
    items: PurchaseReturnItemModel[];
}

export class PurchaseReturnFilterModel {
    id!: number;
    searchQuery!: string;
    statuses?: string[];
    warehouseId?: number;
    fromDate?: string;
    toDate?: string;
    purchaseReturnStatuses?: any[];
    vendorId?: number;
}

export enum ReturnStatus {
    DRAFT = 'DRAFT',
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    PENDING_APPROVAL = "PENDING_APPROVAL",
    CANCELLED = "CANCELLED",
    COMPLETED = "COMPLETED"
}