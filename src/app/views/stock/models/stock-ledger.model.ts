export class StockLedger {
    id!: number;
    itemId!: number;
    itemName!: string;
    warehouseId!: number;
    transactionType!: string; // IN / OUT
    quantity!: number;
    referenceType!: string; // GRN / SALE / TRANSFER / RETURN
    referenceId!: number;
    beforeQty!: number;
    afterQty!: number;
    createdAt!: string;
}

export class StockLedgerFilter {
    id?: number;
    itemId?: number;
    searchQuery?: string;
    statuses?: string[];
    warehouseId?: number;
    fromDate?: string; // ISO string format
    toDate?: string; // ISO string format
    transactionTypes?: string[]; // IN / OUT
    referenceTypes?: string[]; // GRN / SALE / TRANSFER / RETURN        
}