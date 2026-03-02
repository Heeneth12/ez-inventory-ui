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
    active!: boolean;
    status!: string;
    source!: string;
    paymentTerms!: string;
    itemGrossTotal!: number;     // Sum of (UnitPrice * Qty)
    itemTotalDiscount!: number;  // Sum of all item-level discount amounts
    itemTotalTax!: number;       // Sum of all item-level tax amounts
    flatDiscountRate!: number;   // The % the user typed in (e.g., 2)
    flatDiscountAmount!: number; // Calculated $ value from backend
    flatTaxRate!: number;        // The % the user typed in (e.g., 5)
    flatTaxAmount!: number;      // Calculated $ value from backend
    totalTax!:number;
    totalDiscount!:number;
    grandTotal!: number;
    items!: SalesOrderItemsModal[];
    remarks!: string;
}

export class SalesOrderItemsModal {
    id!: number;
    itemId!: number;
    itemName!: string;
    orderedQty!: number;
    invoicedQty!: number;
    quantity!: number;
    unitPrice!: number;
    discountRate!: number;
    discountAmount!: number;
    taxRate!: number;
    taxAmount!: number;
    lineTotal!: number;
}

export class SalesOrderFilterModal extends CommonFilterModel {
    soStatuses?: SoStatus[] | null;
    soSource?: SoSource[] | null;
    customerId!: number;
}

export enum SoStatus {
    CREATED = 'CREATED',
    PENDING = 'PENDING',
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