export class ItemModel {
    id!: string;
    name!: string;
    itemCode!: string;
    sku?: string;
    barcode?: string;
    itemType!: 'SERVICE' | 'PRODUCT';
    imageUrl?: string;
    category!: string;
    unitOfMeasure!: string;
    brand?: string;
    manufacturer?: string;
    purchasePrice!: number;
    sellingPrice!: number;
    mrp?: number;
    taxPercentage?: number;
    discountPercentage?: number;
    hsnSacCode?: string;
    description?: string;
    isActive: boolean = true;
}