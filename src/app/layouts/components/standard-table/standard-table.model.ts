export type LoadMode = 'pagination' | 'infinite';
export type Density = 'compact' | 'normal' | 'comfortable';
export type ColumnType = 'text' | 'number' | 'currency' | 'link' | 'toggle' | 'badge' | 'profile' | 'action';

export interface TableColumn {
    key: string;
    label: string;
    type?: ColumnType; // New: Define the type of data
    align?: 'left' | 'right' | 'center';
    width?: string;
    visible?: boolean;
    sortable?: boolean;
}

export interface TableRow {
    id: string | number;
    [key: string]: any;
}

export interface PaginationConfig {
    pageSize: number;
    currentPage: number;
    totalItems: number;
}

export interface TableAction {
    type: 'view' | 'edit' | 'delete' | 'toggle';
    row: TableRow;
    key?: string; // which column triggered it (for toggles)
}