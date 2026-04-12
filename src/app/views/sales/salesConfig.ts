import { ListRestart, ListCollapse, PenLineIcon, Undo2, XCircle, ArrowRight, CircleX, FileDown, ReceiptIndianRupee, ScrollText, Truck, PackageCheck, Eye, CheckCircle, RotateCcw } from "lucide-angular";
import { TableColumn, TableActionConfig } from "../../layouts/components/standard-table/standard-table.model";
import { DatePickerConfig } from "../../layouts/UI/date-picker/date-picker.component";
import { FilterOption } from "../../layouts/UI/filter-dropdown/filter-dropdown.component";
import { InvoicePaymentStatus } from "./invoices/invoice.modal";

//SO
export const SALES_ORDER_COLUMNS: TableColumn[] = [
    { key: 'contactMini', label: 'Customer', width: '140px', type: 'fullProfile', align: 'left' },
    { key: 'orderNumber', label: 'Order No', width: '130px', type: 'link' },
    { key: 'source', label: 'Source', width: '100px', type: 'badge' },
    { key: 'orderDate', label: 'Order Date', width: '130px', type: 'date', align: 'center' },
    { key: 'grandTotal', label: 'Amount', width: '120px', type: 'currency', align: 'right' },
    { key: 'totalTax', label: 'Tax', width: '120px', type: 'currency', align: 'right' },
    { key: 'totalDiscount', label: "Dis", width: '120px', type: 'currency', align: 'right' },
    { key: 'status', label: 'Status', width: '140px', type: 'badge', align: 'center' },
    { key: 'actions', label: 'Actions', width: '120px', type: 'action', align: 'center', sortable: false }
];

export const SALES_ORDER_ACTIONS: TableActionConfig[] = [
    {
        key: 'move_to_invoice',
        label: 'Move to Invoice',
        icon: ArrowRight,
        color: 'primary',
        condition: (row) => row['status'] === 'CREATED' || row['status'] === 'CONFIRMED'
    },
    {
        key: 'view_sales_order',
        label: '',
        icon: ListCollapse,
        color: 'neutral',
        condition: (row) => true
    },
    {
        key: 'move_to_cancle',
        label: '',
        icon: CircleX,
        color: 'danger',
        condition: (row) => row['status'] === 'CREATED' || row['status'] === 'CONFIRMED' || row['status'] === 'PENDING_APPROVAL'
    }
];

export const SALES_ORDER_FILTER_OPTIONS: FilterOption[] = [
    {
        id: 'status',
        label: 'Status',
        type: 'checkbox',
        searchable: true,
        options: [
            { label: 'DRAFT', value: 'DRAFT' },
            { label: 'PENDING', value: 'PENDING' },
            { label: 'CONFIRMED', value: 'CONFIRMED' },
            { label: 'APPROVED', value: 'APPROVED' },
            { label: 'REJECTED', value: 'REJECTED' },
            { label: 'FULLY_INVOICED', value: 'FULLY_INVOICED' }
        ]
    },
    {
        id: 'source',
        label: 'Source',
        type: 'checkbox',
        searchable: true,
        options: [
            { label: 'Sales Team', value: 'SALES_TEAM' },
            { label: 'Direct Sales', value: 'DIRECT_SALES' },
        ]
    }
];

export const SALES_ORDER_DATE_CONFIG: DatePickerConfig = {
    type: 'both',
    placeholder: 'Start - End'
};


//INVOICE
export const INVOICE_COLUMNS: TableColumn[] = [
    { key: 'contactMini', label: 'Customer', width: '160px', type: 'fullProfile', align: 'left' },
    { key: 'invoiceNumber', label: 'Invoice No', width: '130px', type: 'link' },
    { key: 'invoiceDate', label: 'Inv-Date', width: '130px', type: 'date', align: 'center' },
    { key: 'grandTotal', label: 'Amount', width: '120px', type: 'currency', align: 'center' },
    { key: 'status', label: 'Status', width: '130px', type: 'badge' },
    { key: 'paymentStatus', label: 'Pay-Status', width: '120px', type: 'badge' },
    { key: 'amountPaid', label: 'Paid Amt', width: '130px', type: 'currency', align: 'center' },
    { key: 'balance', label: 'Balance', width: '130px', type: 'currency', align: 'right' },
    { key: 'actions', label: 'Actions', width: '120px', type: 'action', align: 'center', sortable: false }
];

export const INVOICE_ACTIONS: TableActionConfig[] = [
    {
        key: 'payment_details',
        label: 'Payment details',
        icon: ScrollText,
        color: 'success',
        condition: (row) => row['paymentStatus'] === 'PAID'
    },
    {
        key: 'receive_payment',
        label: 'Receive Payment',
        icon: ReceiptIndianRupee,
        color: 'primary',
        condition: (row) => row['paymentStatus'] === 'UNPAID' || row['paymentStatus'] === 'PARTIALLY_PAID'
    },
    {
        key: 'download_invoice',
        label: '',
        icon: FileDown,
        color: 'neutral',
        condition: (row) => true
    },
    {
        key: 'view_invoice',
        label: '',
        icon: ListCollapse,
        color: 'neutral',
        condition: (row) => true
    },
    {
        key: 'sales_return',
        label: '',
        icon: Undo2,
        color: 'danger',
        condition: (row) => true
    },
]
export const INVOICE_FILTER_OPTIONS: FilterOption[] = [
    {
        id: 'status',
        label: 'Status',
        type: 'checkbox',
        searchable: true,
        options: [
            { label: 'DRAFT', value: 'DRAFT' },
            { label: 'PENDING', value: 'PENDING' },
            { label: 'CONFIRMED', value: 'CONFIRMED' },
            { label: 'APPROVED', value: 'APPROVED' },
            { label: 'REJECTED', value: 'REJECTED' },
            { label: 'FULLY_INVOICED', value: 'FULLY_INVOICED' }
        ]
    },
    {
        id: 'paymentStatus',
        label: 'Payment Status',
        type: 'checkbox',
        searchable: true,
        options: [
            { label: 'UNPAID', value: InvoicePaymentStatus.UNPAID },
            { label: 'PARTIALLY_PAID', value: InvoicePaymentStatus.PARTIALLY_PAID },
            { label: 'PAID', value: InvoicePaymentStatus.PAID }
        ]
    }
];
export const INVOICE_DATE_CONFIG: DatePickerConfig = {
    type: 'both',
    placeholder: 'Start - End'
};

// DELIVERY
export const DELIVERY_COLUMNS: TableColumn[] = [
    { key: 'contactMini', label: 'Customer', width: '140px', type: 'fullProfile', align: 'left' },
    { key: 'deliveryNumber', label: 'Delivery Number', width: '200px', type: 'link' },
    { key: 'type', label: 'Type', width: '100px', type: 'badge' },
    { key: 'status', label: 'Status', width: '90px', type: 'badge' },
    { key: 'scheduledDate', label: 'Scheduled Date', align: 'right', width: '110px', type: 'date' },
    { key: 'shippedDate', label: 'Shipped Date', align: 'right', width: '110px', type: 'date' },
    { key: 'deliveredDate', label: 'Delivered Date', align: 'right', width: '110px', type: 'date' },
    { key: 'actions', label: 'Actions', align: 'center', width: '120px', type: 'action', sortable: false }
];

export const DELIVERY_ACTIONS: TableActionConfig[] = [
    {
        key: 'view_delivery',
        label: '',
        icon: ListCollapse,
        color: 'neutral',
        condition: (row) => true
    },
    {
        key: 'move_to_delivery',
        label: 'Move to Delivery',
        icon: Truck,
        color: 'primary',
        condition: (row) => row['status'] === 'SCHEDULED'
    },
    {
        key: 'make_as_delivered',
        label: 'Make as Delivered',
        icon: PackageCheck,
        color: 'success',
        condition: (row) => row['status'] === 'SHIPPED'
    }
];

export const DELIVERY_FILTER_OPTIONS: FilterOption[] = [
    {
        id: 'type',
        label: 'Type',
        type: 'checkbox',
        searchable: true,
        options: [
            { label: 'In House Delivery', value: 'IN_HOUSE_DELIVERY' },
            { label: 'Third Party Courier', value: 'THIRD_PARTY_COURIER' },
            { label: 'Customer Pickup', value: 'CUSTOMER_PICKUP' }
        ]
    },
    {
        id: 'shipmentStatus',
        label: 'Shipment Status',
        type: 'checkbox',
        searchable: true,
        options: [
            { label: 'Pending', value: 'PENDING' },
            { label: 'Scheduled', value: 'SCHEDULED' },
            { label: 'Shipped', value: 'SHIPPED' },
            { label: 'Delivered', value: 'DELIVERED' },
            { label: 'Cancelled', value: 'CANCELLED' }
        ]
    }
];

export const DELIVERY_DATE_CONFIG: DatePickerConfig = {
    type: 'both',
    placeholder: 'Start - End'
};

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
        condition: (row) => row['status'] === 'COMPLETED' || row['status'] === 'RECEIVED'
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

// SALES RETURNS
export const SALES_RETURNS_COLUMNS: TableColumn[] = [
    { key: 'contactMini', label: 'Customer', width: '140px', type: 'fullProfile', align: 'left' },
    { key: 'returnNumber', label: 'Return Number', width: '200px', type: 'link' },
    { key: 'returnDate', label: 'Return Date', width: '100px', type: 'date' },
    { key: 'totalAmount', label: 'Amount', width: '90px', type: 'currency' },
    { key: 'status', label: 'Status', align: 'right', width: '110px', type: 'badge' },
    { key: 'paymentMethod', label: 'Payment Method', align: 'right', width: '130px', type: 'text' },
    { key: 'actions', label: 'Actions', align: 'center', width: '120px', type: 'action', sortable: false }
];

export const SALES_RETURNS_ACTIONS: TableActionConfig[] = [
    {
        key: 'return_details',
        label: 'Return details',
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

export const SALES_RETURNS_FILTER_OPTIONS: FilterOption[] = [
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

export const SALES_RETURNS_DATE_CONFIG: DatePickerConfig = {
    type: 'both',
    placeholder: 'Start - End'
};

// ─── ADVANCE PAYMENTS ───────────────────────────────────────────────────────

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

// ─── CREDIT NOTES ───────────────────────────────────────────────────────────

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
