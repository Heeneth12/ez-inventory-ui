import { CommonFilterModel } from "../../../layouts/models/common-filter.model";
import { ContactMiniModel } from "../../contacts/contacts.model";

export class SalesOrderModal {
    id!: number;
    warehouseId!: number;
    orderNumber!: string;
    orderDate!: string;
    contactMini!: ContactMiniModel
    customerId!: number;
    customerName!: string;
    paymentTerms!: string;
    totalAmount!: number;
    discount!: number;
    tax!: number;
    subTotal!: number;
    grandTotal!: number;
    totalDiscount!: number;
    totalTax!: number;
    active!: boolean;
    status!: string;
    source!: string;
    items!: SalesOrderItemsModal[];
    remarks!: string;
}

export class SalesOrderItemsModal {
    id!: number;
    itemId!: number;
    itemName!: string;
    orderedQty!: number;
    quantity!: number;
    unitPrice!: number;
    discount!: number;
    tax!: number;
    lineTotal!: number;
}

export class SalesOrderFilterModal extends CommonFilterModel {
    soStatuses?: SoStatus[] | null;
    soSource?: SoSource[] | null;
    customerId!: number;
}

export enum SoStatus {
    CREATED = 'CREATED',
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED',
    CONFIRMED = 'CONFIRMED',
    PARTIALLY_INVOICED = 'PARTIALLY_INVOICED',
    FULLY_INVOICED = 'FULLY_INVOICED'
}

export enum SoSource {
    SALES_TEAM = 'SALES_TEAM',
    DIRECT_SALES = 'DIRECT_SALES',
    MARKETING_CAMPAIGN = 'MARKETING_CAMPAIGN',
    ONLINE_CHANNEL = 'ONLINE_CHANNEL',
    REPEAT_ORDER = 'REPEAT_ORDER'
}