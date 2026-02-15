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
