export class ItemModel {
    id!: string;
    name!: string;
    description?: string;
    itemCode!: string;
    sku?: string;
    barcode?: string;
    type!: 'SERVICE' | 'PRODUCT';
    category!: string;
    unitOfMeasure!: string;
    purchasePrice!: number;
    sellingPrice!: number;
    mrp?: number;
    taxPercentage?: number;
    discountPercentage?: number;
    openingStock?: number;
    reorderLevel?: number;
    warehouseId!: string;
    hsnSacCode?: string;
    isActive: boolean = true;
}
