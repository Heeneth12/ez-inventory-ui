import { ArrowRight, ListRestart, ListCollapse, PenLineIcon, XCircle, Undo2 } from "lucide-angular";
import { TableActionConfig, TableColumn } from "../../layouts/components/standard-table/standard-table.model";
import { DatePickerConfig } from "../../layouts/UI/date-picker/date-picker.component";
import { FilterOption } from "../../layouts/UI/filter-dropdown/filter-dropdown.component";

//PRQ
export const PRQ_COLUMN: TableColumn[] = [
    { key: 'vendorDetails', label: 'Vendor', width: '100px', type: 'fullProfile' },
    { key: 'prqNumber', label: 'PRQ Number', width: '100px', type: 'link', align:'left' },
    { key: 'source', label: 'Source', width: '100px', type: 'badge' },
    { key: 'createdAt', label: 'Order Date', width: '110px', type: 'date' },
    { key: 'status', label: 'status', width: '100px', type: 'badge' },
    { key: 'totalEstimatedAmount', label: 'TotalAmount', width: '110px', type: 'currency', align: 'right' },
    { key: 'actions', label: 'Actions', align: 'center', width: '120px', type: 'action', sortable: false }
];

export const PRQ_ACTIONS: TableActionConfig[] = [
    {
        key: 'review_prq',
        label: 'Review PRQ',
        icon: ListRestart,
        color: 'success',
        condition: (row) => row['status'] === 'DRAFT'
    },
    {
        key: 'view_details',
        label: 'View Details',
        icon: ListCollapse,
        color: 'neutral',
        condition: (row) => true
    },
    {
        key: 'edit_details',
        label: 'Edit Details',
        icon: PenLineIcon,
        color: 'primary',
        condition: (row) => row['status'] === 'PENDING'
    },
     {
        key: 'return_items',
        label: 'Return',
        icon: Undo2,
        color: 'danger',
        condition: (row) => row['status'] === 'ACCEPTED'
    },
    {
        key: 'delete_prq',
        label: '',
        icon: XCircle,
        color: 'danger',
        condition: (row) => row['status'] === 'DRAFT' || row['status'] === 'PENDING'
    }
];

export const PRQ_DATE_CONFIG: DatePickerConfig = {
    type: 'both',
    placeholder: 'Start - End'
};

export const PRQ_FILTER_OPTIONS: FilterOption[] = [
    {
        id: 'status',
        label: 'Status',
        type: 'checkbox',
        searchable: true,
        options: [
            { label: 'PENDING', value: 'PENDING' },
            { label: 'APPROVED', value: 'APPROVED' },
            { label: 'REJECTED', value: 'REJECTED' }
        ]
    }
];


//PO
export const PO_COLUMN: TableColumn[] = [
    { key: 'vendorDetails', label: 'Vendor', width: '100px', type: 'fullProfile' },
    { key: 'orderNumber', label: 'PO Number', width: '100px', type: 'link' },
    { key: 'createdAt', label: 'Order Date', width: '110px', type: 'date' },
    { key: 'expectedDeliveryDate', label: 'Delivery Date', width: '110px', type: 'date' },
    { key: 'status', label: 'status', width: '100px', type: 'badge' },
    { key: 'totalAmount', label: 'TotalAmount', width: '110px', type: 'currency', align: 'right' },
    { key: 'actions', label: 'Actions', align: 'center', width: '120px', type: 'action', sortable: false }
];

export const PO_ACTIONS: TableActionConfig[] = [
    {
        key: 'move_to_grn',
        label: 'Move to GRN',
        icon: ArrowRight,
        color: 'primary',
        condition: (row) => row['status'] === 'ISSUED' || row['status'] === 'PARTIALLY_RECEIVED' || row['status'] === 'ASN_CONFIRMED'
    },
    {
        key: 'view_grn_details',
        label: 'GRN Details',
        icon: ArrowRight,
        color: 'success',
        condition: (row) => row['status'] === 'COMPLETED'
    },
    {
        key: 'review_po',
        label: 'Review PO',
        icon: ListRestart,
        color: 'danger',
        condition: (row) => row['status'] === 'DRAFT'
    },
    {
        key: 'view_details',
        label: 'View Details',
        icon: ListCollapse,
        color: 'neutral',
        condition: (row) => true
    }
];

export const PO_DATE_CONFIG: DatePickerConfig = {
    type: 'both',
    placeholder: 'Start - End'
};

export const PO_FILTER_OPTIONS: FilterOption[] = [
    {
        id: 'status',
        label: 'Status',
        type: 'checkbox',
        searchable: true,
        options: [
            { label: 'PENDING', value: 'PENDING' },
            { label: 'APPROVED', value: 'APPROVED' },
            { label: 'REJECTED', value: 'REJECTED' }
        ]
    }
];

//GRN
export const GRN_COLUMN: TableColumn[] = [
    { key: 'vendorDetails', label: 'Vendor', width: '100px', type: 'fullProfile' },
    { key: 'grnNumber', label: 'GRN Number', width: '100px', type: 'link', sortable: true },
    { key: 'createdAt', label: 'GRN Date', width: '120px', type: 'date' },
    { key: 'purchaseOrderId', label: 'PO Reference', width: '150px', type: 'text' },
    { key: 'vendorInvoiceNo', label: 'Invoice No.', width: '200px', type: 'text' },
    { key: 'createdAt', label: 'Received Date', width: '120px', type: 'date' },
    { key: 'displayStatus', label: 'Status', width: '100px', type: 'badge' },
    { key: 'actions', label: 'Actions', align: 'center', width: '100px', type: 'action', sortable: false }
];


export const GRN_DATE_CONFIG: DatePickerConfig = {
    type: 'both',
    placeholder: 'Start - End'
};

export const GRN_FILTER_OPTIONS: FilterOption[] = [];

//PR
export const PR_COLUMN: TableColumn[] = [
    { key: 'vendorDetails', label: 'Vendor', width: '100px', type: 'fullProfile' },
    { key: 'prNumber', label: 'PR Number', width: '100px', type: 'link' },
    { key: 'status', label: 'status', width: '100px', type: 'badge' },
    { key: 'totalAmount', label: 'TotalAmount', width: '110px', type: 'currency' },
    { key: 'id', label: 'Grn', width: '150px', type: 'link' },
    { key: 'actions', label: 'Actions', align: 'center', width: '120px', type: 'action', sortable: false }
];

export const PR_ACTIONS: TableActionConfig[] = [
    {
        key: 'update_pr',
        label: 'Update PR',
        icon: ArrowRight,
        color: 'primary',
        condition: (row) => row['status'] === 'PENDING'
    },
    {
        key: 'cancel_pr',
        label: 'Cancel PR',
        icon: ArrowRight,
        color: 'success',
        condition: (row) => row['status'] === 'PENDING'
    },
];

export const PR_DATE_CONFIG: DatePickerConfig = {
    type: 'both',
    placeholder: 'Start - End'
};

export const PR_FILTER_OPTIONS: FilterOption[] = [
    {
        id: 'status',
        label: 'Status',
        type: 'checkbox',
        searchable: true,
        options: [
            { label: 'PENDING', value: 'PENDING' },
            { label: 'APPROVED', value: 'APPROVED' },
            { label: 'REJECTED', value: 'REJECTED' }
        ]
    }
];