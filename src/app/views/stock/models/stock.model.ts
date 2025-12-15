
export class StockModel {
    id!: number
    itemId!: number
    itemName!: string
    warehouseId!: number
    openingQty: number = 0
    inQty: number = 0
    outQty: number = 0
    closingQty: number = 0
    averageCost: number = 0.00
    stockValue: number = 0.00
}
export class ItemStockSearchModel {
    itemId!: number;          // Long itemId
    name!: string;            // String name
    code!: string;            // String code
    sku!: string;             // String sku
    batches!: BatchDetailModel[];
}
export interface BatchDetailModel {
    batchNumber: string;      // corresponds to String batchNumber
    buyPrice: number;         // corresponds to BigDecimal buyPrice
    remainingQty: number;     // corresponds to Integer remainingQty
    expiryDate: number;       // corresponds to Long expiryDate (timestamp)
}
