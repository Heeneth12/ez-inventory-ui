export type LoadMode = 'pagination' | 'infinite';
export type Density = 'compact' | 'normal' | 'comfortable';
export type ColumnType = 'text' | 'number' | 'currency' | 'link' | 'toggle' | 'badge' | 'profile' | 'action' | 'date' | 'stepper' | 'fullProfile';

export interface TableColumn {
    key: string;
    label: string;
    type?: ColumnType; // New: Define the type of data
    align?: 'left' | 'right' | 'center';
    width?: string;
    visible?: boolean;
    sortable?: boolean;
    dateFormat?: string;
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

export interface TableActionConfig {
    key: string;            // Identifier (e.g., 'move_to_grn')
    label: string;          // Text to show (e.g., 'Move to GRN')
    icon?: any;             // Lucide icon (optional)
    color?: 'primary' | 'danger' | 'success' | 'neutral'; // Button style
    condition?: (row: TableRow) => boolean; // Logic to show/hide this button per row
}

// Update TableAction to include the custom definition
export interface TableAction {
    type: 'view' | 'edit' | 'delete' | 'toggle' | 'custom'; // Added 'custom'
    row: TableRow;
    key?: string;
}