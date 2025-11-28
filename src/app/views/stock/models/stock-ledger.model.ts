 export class StockLedger {
    id!: number;
    itemId!: number;
    warehouseId!: number;
    transactionType!: string; // IN / OUT
    quantity!: number;
    referenceType!: string; // GRN / SALE / TRANSFER / RETURN
    referenceId!: number;
    beforeQty!: number;
    afterQty!: number;  
}