export class ItemModel {
    id!: number;
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

export class ItemSearchFilter {
    searchQuery?: string | null;
    active?: boolean | null;
    itemTypes?: ('SERVICE' | 'PRODUCT')[] | null;
    brand?: string | null;
    category?: string | null;
}