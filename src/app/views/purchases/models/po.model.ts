import { CommonFilterModel } from "../../../layouts/models/common-filter.model";
import { UserMiniModel } from "../../user-management/models/user.model";

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
    vendorId: number;
    warehouseId: number;
    expectedDeliveryDate: number;
    status: string;
    notes?: string;
    totalAmount: number;
    vendorDetails: UserMiniModel;
    items: PurchaseOrderItemModel[];
}
export class PurchaseOrderFilter extends CommonFilterModel {
    vendorId?: number;
    poStatuses?: PurchaseOrderStatus[];
}

export enum PurchaseOrderStatus {
    DRAFT = 'DRAFT',
    ISSUED = 'ISSUED',
    PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    PENDING = 'PENDING',
    ASN_CONFIRMED = 'ASN_CONFIRMED',
    ASN_PENDING = 'ASN_PENDING'
}