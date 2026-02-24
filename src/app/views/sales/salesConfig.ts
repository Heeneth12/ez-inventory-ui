import { ListRestart, ListCollapse, PenLineIcon, Undo2, XCircle, ArrowRight, CircleX } from "lucide-angular";
import { TableColumn, TableActionConfig } from "../../layouts/components/standard-table/standard-table.model";
import { DatePickerConfig } from "../../layouts/UI/date-picker/date-picker.component";
import { FilterOption } from "../../layouts/UI/filter-dropdown/filter-dropdown.component";

//SO
export const SALES_ORDER_COLUMNS: TableColumn[] = [
    { key: 'contactMini', label: 'Customer', width: '140px', type: 'fullProfile', align: 'left' },
    { key: 'orderNumber', label: 'Order No', width: '130px', type: 'link' },
    { key: 'source', label: 'Source', width: '100px', type: 'badge' },
    { key: 'orderDate', label: 'Order Date', width: '130px', type: 'date', align: 'center' },
    { key: 'grandTotal', label: 'Amount', width: '120px', type: 'currency', align: 'right' },
    { key: 'totalTax', label: 'Tax', width: '120px', type: 'currency', align: 'right' },
    { key: 'totalDiscount', label: "Dis", width: '120px', type: 'currency', align: 'right' },
    { key: 'totalDiscountPer', label: "Dis %", width: '80px', type: 'text', align: 'center' },
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
        key: 'move_to_cancle',
        label: '',
        icon: CircleX,
        color: 'danger',
        condition: (row) => row['status'] === 'CREATED' || row['status'] === 'CONFIRMED'
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
    { key: 'totalDiscount', label: "Dis %", width: '120px', type: 'currency', align: 'center' },
    { key: 'status', label: 'Status', width: '130px', type: 'badge' },
    { key: 'paymentStatus', label: 'Pay-Status', width: '120px', type: 'badge' },
    { key: 'amountPaid', label: 'Paid Amt', width: '130px', type: 'currency', align: 'center' },
    { key: 'balance', label: 'Balance', width: '130px', type: 'currency', align: 'right' },
    { key: 'grandTotal', label: 'Total Amt', width: '130px', type: 'currency', align: 'right' },
    { key: 'actions', label: 'Actions', width: '120px', type: 'action', align: 'center', sortable: false }
];

export const INVOICE_ACTIONS: TableActionConfig[] = []
export const INVOICE_FILTER_OPTIONS: FilterOption[] = [];
export const INVOICE_DATE_CONFIG: DatePickerConfig = {
    type: 'both',
    placeholder: 'Start - End'
};
