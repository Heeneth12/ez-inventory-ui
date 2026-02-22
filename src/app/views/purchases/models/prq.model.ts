import { CommonFilterModel } from "../../../layouts/models/common-filter.model";
import { UserMiniModel } from "../../user-management/models/user.model";

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
    warehouseId?: string;
    requestedBy: number;
    department: string;
    prqNumber?: string;
    status?: PrqStatus;
    totalEstimatedAmount?: number;
    notes?: string;
    createdAt?: string;
    vendorDetails: UserMiniModel;
    items: PurchaseRequestItemModel[];
}

export class PurchaseRequestFilterModel extends CommonFilterModel {
    vendorId?: number;
    prqStatuses?: PrqStatus[];
}

export enum PrqStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    CONVERTED = 'CONVERTED'
}