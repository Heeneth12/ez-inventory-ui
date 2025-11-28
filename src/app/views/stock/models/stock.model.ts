
export class StockModel {
    id!: number
    itemId!: number
    warehouseId!: number
    openingQty: number = 0
    inQty: number = 0
    outQty: number = 0
    closingQty: number = 0
    averageCost: number = 0.00
    stockValue: number = 0.00
}
