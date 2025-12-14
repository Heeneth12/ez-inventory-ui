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

export class SalesOrderFilterModal {
}
