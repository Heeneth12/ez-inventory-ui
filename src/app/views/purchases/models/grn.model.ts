import { CommonFilterModel } from "../../../layouts/models/common-filter.model";
import { UserMiniModel } from "../../user-management/models/user.model";

export interface GrnItemModel {
    poItemId: number;
    poItemPrice: number;
    itemId: number;
    receivedQty: number;
    rejectedQty: number;
    returnedQty: number;
    batchNumber?: string;
    expiryDate?: number;
}

export interface GrnModel {
    id: number;
    vendorId: number;
    grnNumber: string;
    purchaseOrderId: number;
    vendorInvoiceNo?: string;
    status: string;
    items: GrnItemModel[];
    vendorDetails: UserMiniModel;
    createdAt: Date;
}

export class GrnFilterModel extends CommonFilterModel {
    vendorId?: number;
    grnStatuses?: GrnStatus[];
}

export enum GrnStatus {
    DRAFT = 'DRAFT',
    PENDING_QA = 'PENDING_QA',
    RECEIVED = 'RECEIVED',
    CANCELLED = 'CANCELLED'
}