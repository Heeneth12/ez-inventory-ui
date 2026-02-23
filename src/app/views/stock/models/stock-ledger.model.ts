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
    fromDate?: string | null; // ISO string format
    toDate?: string | null; // ISO string format
    transactionTypes?: string[] | null; // IN / OUT
    referenceTypes?: string[] | null; // GRN / SALE / TRANSFER / RETURN        
}