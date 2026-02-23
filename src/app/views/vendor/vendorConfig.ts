import { ListRestart, ListCollapse, PenLineIcon, ArrowBigRight, CircleX, CloudUpload, ArrowRight, MailIcon, Eye, ListCheck } from "lucide-angular";
import { TableActionConfig, TableColumn } from "../../layouts/components/standard-table/standard-table.model";
import { DatePickerConfig } from "../../layouts/UI/date-picker/date-picker.component";
import { FilterOption } from "../../layouts/UI/filter-dropdown/filter-dropdown.component";

//NEW ORDERS
export const NEW_ORDERS_COLUMN: TableColumn[] = [
    { key: 'prqNumber', label: 'PRQ Number', width: '100px', type: 'link' },
    { key: 'source', label: 'Source', width: '100px', type: 'badge' },
    { key: 'createdAt', label: 'Order Date', width: '110px', type: 'date' },
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

export const NEW_ORDERS_FILTER_CONFIG: FilterOption[] = [
    {
        id: 'status',
        label: 'Status',
        type: 'checkbox',
        searchable: true,
        options: [
            { label: 'DRAFT', value: 'DRAFT' },
            { label: 'PENDING', value: 'PENDING' },
            { label: 'APPROVED', value: 'APPROVED' },
            { label: 'REJECTED', value: 'REJECTED' },
            { label: 'CONVERTED', value: 'CONVERTED' }
        ]
    }
];

export const NEW_ORDERS_DATE_CONFIG: DatePickerConfig = {
    type: 'both',
    placeholder: 'Start - End'
};

// ASN
export const ANS_COLUMN: TableColumn[] = [
    { key: 'orderNumber', label: 'PO Number', width: '100px', type: 'link' },
    { key: 'createdAt', label: 'Order Date', width: '110px', type: 'date' },
    { key: 'expectedDeliveryDate', label: 'Delivery Date', width: '110px', type: 'date' },
    { key: 'supplierName', label: 'Supplier', width: '110px', type: 'text' },
    { key: 'status', label: 'status', width: '100px', type: 'badge' },
    { key: 'totalAmount', label: 'TotalAmount', width: '110px', type: 'currency', align: 'right' },
    { key: 'actions', label: 'Actions', align: 'center', width: '120px', type: 'action', sortable: false }
];

export const ASN_ACTIONS: TableActionConfig[] = [
    {
        key: 'send_asn',
        label: 'Send ASN',
        icon: MailIcon,
        color: 'danger',
        condition: (row) => row['status'] === 'PENDING'
    },
    {
        key: 'view_details',
        label: 'View Details',
        icon: ListCollapse,
        color: 'neutral',
        condition: (row) => true
    }
];

export const ASN_DATE_CONFIG: DatePickerConfig = {
    type: 'both',
    placeholder: 'Start - End'
};

export const ASN_FILTER_OPTIONS: FilterOption[] = [
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

// V-PR
export const V_PR_COLUMN: TableColumn[] = [
    { key: 'vendorDetails', label: 'Vendor', width: '100px', type: 'fullProfile' },
    { key: 'prNumber', label: 'PR Number', width: '100px', type: 'link' },
    { key: 'status', label: 'status', width: '100px', type: 'badge' },
    { key: 'totalAmount', label: 'TotalAmount', width: '110px', type: 'currency' },
    { key: 'id', label: 'Grn', width: '150px', type: 'link' },
    { key: 'actions', label: 'Actions', align: 'center', width: '120px', type: 'action', sortable: false }
];

export const V_PR_ACTIONS: TableActionConfig[] = [
    {
        key: 'accept_pr',
        label: 'Accept PR',
        icon: ArrowRight,
        color: 'success',
        condition: (row) => row['status'] === 'PENDING'
    },
    {
        key: 'view_pr',
        label: '',
        icon: ListCheck,
        color: 'primary',
        condition: (row) => true
    },
    {
        key: 'cancel_pr',
        label: '',
        icon: CircleX,
        color: 'danger',
        condition: (row) => row['status'] === 'PENDING'
    },
];

export const V_PR_DATE_CONFIG: DatePickerConfig = {
    type: 'both',
    placeholder: 'Start - End'
};

export const V_PR_FILTER_OPTIONS: FilterOption[] = [
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