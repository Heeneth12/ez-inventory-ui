import { CommonFilterModel } from "../../../layouts/models/common-filter.model";

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

export class StockLedgerFilter extends CommonFilterModel {
    itemId?: number;
    transactionTypes?: string[] | null; // IN / OUT
    referenceTypes?: string[] | null; // GRN / SALE / TRANSFER / RETURN        
}