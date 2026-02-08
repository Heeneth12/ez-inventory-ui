import { ListRestart, ListCollapse, PenLineIcon, ArrowBigRight, CircleX } from "lucide-angular";
import { TableActionConfig, TableColumn } from "../../layouts/components/standard-table/standard-table.model";
import { DatePickerConfig } from "../../layouts/UI/date-picker/date-picker.component";
import { FilterOption } from "../../layouts/UI/filter-dropdown/filter-dropdown.component";

//NEW ORDERS
export const NEW_ORDERS_COLUMN: TableColumn[] = [
    { key: 'prqNumber', label: 'PRQ Number', width: '100px', type: 'link' },
    { key: 'createdAt', label: 'Order Date', width: '110px', type: 'date' },
    { key: 'supplierName', label: 'Supplier', width: '110px', type: 'text' },
    { key: 'status', label: 'status', width: '100px', type: 'badge' },
    { key: 'totalEstimatedAmount', label: 'TotalAmount', width: '110px', type: 'currency', align: 'right' },
    { key: 'actions', label: 'Actions', align: 'center', width: '120px', type: 'action', sortable: false }
];

export const NEW_ORDERS_ACTIONS: TableActionConfig[] = [
    {
        key: 'view_details',
        label: 'View Details',
        icon: ListCollapse,
        color: 'neutral',
        condition: (row) => true
    },
    {
        key: 'move_to_po',
        label: 'Move to PO',
        icon: ArrowBigRight,
        color: 'primary',
        condition: (row) => row['status'] === 'PENDING'
    },
    {
        key: 'cancel_order',
        label: '',
        icon: CircleX,
        color: 'danger',
        condition: (row) => row['status'] === 'PENDING'
    }
];

export const filterConfig: FilterOption[] = [
    {
        id: 'status',
        label: 'Status',
        type: 'checkbox',
        searchable: true,   
        options: [
            { label: 'PENDING', value: 'PENDING' },
            { label: 'CANCELLED', value: 'CANCELLED' },
            { label: 'OTHER', value: 'OTHER' }
        ]
    }
];

export const NEW_ORDERS_DATE_CONFIG: DatePickerConfig = {
    type: 'both',
    placeholder: 'Start - End'
};