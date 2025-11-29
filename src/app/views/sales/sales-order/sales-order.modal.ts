export class SalesOrderModal {
    id!: number;
    orderNumber!: string;
    orderDate!: string;
    customerId!: number;
    customerName!: string;
    paymentTerms!: string;
    totalAmount!: number;
    discount!: number;
    tax!: number;
    grandTotal!: number;
    active!: boolean;
    status!: string;
    items!: SalesOrderItemsModal[];
    remarks!: string;
}

export class SalesOrderItemsModal {
    id!: number;
    itemId!: number;
    itemName!: string;
    quantity!: number;
    unitPrice!: number;
    discount!: number;
    tax!: number;
    lineTotal!: number;
}

export class SalesOrderFilterModal {
}
