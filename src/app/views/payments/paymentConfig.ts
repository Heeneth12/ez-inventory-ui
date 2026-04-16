import { ScrollText, FileDown, Eye, CheckCircle, RotateCcw } from "lucide-angular";
import { TableColumn, TableActionConfig } from "../../layouts/components/standard-table/standard-table.model";
import { DatePickerConfig } from "../../layouts/UI/date-picker/date-picker.component";
import { FilterOption } from "../../layouts/UI/filter-dropdown/filter-dropdown.component";

// PAYMENTS
export const PAYMENTS_COLUMNS: TableColumn[] = [
    { key: 'contactMini', label: 'Customer', width: '140px', type: 'fullProfile', align: 'left' },
    { key: 'paymentNumber', label: 'Payment Number', width: '200px', type: 'link' },
    { key: 'paymentDate', label: 'Payment Date', width: '100px', type: 'date' },
    { key: 'amount', label: 'Amount', width: '90px', type: 'text' },
    { key: 'status', label: 'Status', align: 'right', width: '110px', type: 'badge' },
    { key: 'paymentMethod', label: 'Payment Method', align: 'right', width: '130px', type: 'text' },
    { key: 'allocatedAmount', label: 'Allocated Amount', align: 'right', width: '110px', type: 'currency' },
    { key: 'unallocatedAmount', label: 'Unallocated Amount', align: "center", width: '110px', type: 'currency' },
    { key: 'actions', label: 'Actions', align: 'center', width: '120px', type: 'action', sortable: false }
];

export const PAYMENTS_ACTIONS: TableActionConfig[] = [
    {
        key: 'payment_details',
        label: 'Payment details',
        icon: ScrollText,
        color: 'primary',
        condition: (row) => true
    },
    {
        key: 'download_receipt',
        label: '',
        icon: FileDown,
        color: 'neutral',
        condition: (row) => true
    },
]

export const PAYMENTS_FILTER_OPTIONS: FilterOption[] = [
    {
        id: 'status',
        label: 'Status',
        type: 'checkbox',
        searchable: true,
        options: [
            { label: 'PENDING', value: 'PENDING' },
            { label: 'COMPLETED', value: 'COMPLETED' },
            { label: 'RECEIVED', value: 'RECEIVED' },
            { label: 'FAILED', value: 'FAILED' }
        ]
    }
];

export const PAYMENTS_DATE_CONFIG: DatePickerConfig = {
    type: 'both',
    placeholder: 'Start - End'
};


// ADVANCE PAYMENTS
export const ADVANCE_COLUMNS: TableColumn[] = [
    { key: 'contactMini', label: 'Customer', width: '160px', type: 'fullProfile', align: 'left' },
    { key: 'advanceNumber', label: 'Advance #', width: '160px', type: 'link' },
    { key: 'receivedDate', label: 'Received Date', width: '120px', type: 'date' },
    { key: 'amount', label: 'Amount', width: '100px', type: 'currency', align: 'right' },
    { key: 'availableBalance', label: 'Available', width: '110px', type: 'currency', align: 'right' },
    { key: 'paymentMethod', label: 'Method', width: '110px', type: 'text', align: 'center' },
    { key: 'status', label: 'Status', width: '120px', type: 'badge', align: 'center' },
    { key: 'actions', label: 'Actions', width: '120px', type: 'action', align: 'center', sortable: false }
];

export const ADVANCE_ACTIONS: TableActionConfig[] = [
    {
        key: 'view_detail',
        label: 'View Detail',
        icon: Eye,
        color: 'primary',
        condition: () => true
    },
    {
        key: 'utilize',
        label: 'Apply to Invoice',
        icon: CheckCircle,
        color: 'success',
        condition: (row) => row['status'] === 'ACTIVE' && row['availableBalance'] > 0
    },
    {
        key: 'refund',
        label: 'Refund',
        icon: RotateCcw,
        color: 'neutral',
        condition: (row) => row['status'] === 'ACTIVE' && row['availableBalance'] > 0
    }
];

export const ADVANCE_FILTER_OPTIONS: FilterOption[] = [
    {
        id: 'status',
        label: 'Status',
        type: 'checkbox',
        searchable: false,
        options: [
            { label: 'ACTIVE', value: 'ACTIVE' },
            { label: 'EXHAUSTED', value: 'EXHAUSTED' },
            { label: 'REFUNDED', value: 'REFUNDED' },
            { label: 'PARTIALLY_REFUNDED', value: 'PARTIALLY_REFUNDED' }
        ]
    }
];

export const ADVANCE_DATE_CONFIG: DatePickerConfig = {
    type: 'both',
    placeholder: 'Start - End'
};

// CREDIT NOTES
export const CREDIT_NOTE_COLUMNS: TableColumn[] = [
    { key: 'contactMini', label: 'Customer', width: '160px', type: 'fullProfile', align: 'left' },
    { key: 'creditNoteNumber', label: 'Credit Note #', width: '160px', type: 'link' },
    { key: 'issueDate', label: 'Issue Date', width: '120px', type: 'date' },
    { key: 'amount', label: 'Amount', width: '100px', type: 'currency', align: 'right' },
    { key: 'availableBalance', label: 'Available', width: '110px', type: 'currency', align: 'right' },
    { key: 'status', label: 'Status', width: '120px', type: 'badge', align: 'center' },
    { key: 'actions', label: 'Actions', width: '120px', type: 'action', align: 'center', sortable: false }
];

export const CREDIT_NOTE_ACTIONS: TableActionConfig[] = [
    {
        key: 'view_detail',
        label: 'View Detail',
        icon: Eye,
        color: 'primary',
        condition: () => true
    },
    {
        key: 'utilize',
        label: 'Apply to Invoice',
        icon: CheckCircle,
        color: 'success',
        condition: (row) => row['status'] === 'ACTIVE' && row['availableBalance'] > 0
    },
    {
        key: 'refund',
        label: 'Refund',
        icon: RotateCcw,
        color: 'neutral',
        condition: (row) => row['status'] === 'ACTIVE' && row['availableBalance'] > 0
    }
];

export const CREDIT_NOTE_FILTER_OPTIONS: FilterOption[] = [
    {
        id: 'status',
        label: 'Status',
        type: 'checkbox',
        searchable: false,
        options: [
            { label: 'ACTIVE', value: 'ACTIVE' },
            { label: 'EXHAUSTED', value: 'EXHAUSTED' },
            { label: 'REFUNDED', value: 'REFUNDED' },
            { label: 'PARTIALLY_REFUNDED', value: 'PARTIALLY_REFUNDED' }
        ]
    }
];

export const CREDIT_NOTE_DATE_CONFIG: DatePickerConfig = {
    type: 'both',
    placeholder: 'Start - End'
};
