export class CommonFilterModel {
    id?: number;
    searchQuery?: string;
    statuses?: string[];
    warehouseId?: number;
    fromDate?: string | null;
    toDate?: string | null;
}