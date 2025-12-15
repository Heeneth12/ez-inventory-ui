import { TableColumn } from "../components/standard-table/standard-table.model";

//sales order
export const SALES_ORDER_COLUMNS: TableColumn[] = [
    { key: 'contactMini', label: 'Customer', width: '100px', type: 'fullProfile', align: 'left' },
    { key: 'orderNumber', label: 'Order No', width: '130px', type: 'link' },
    { key: 'source', label: 'Source', width: '100px', type: 'badge' },
    { key: 'orderDate', label: 'Order Date', width: '130px', type: 'date', align: 'center' },
    { key: 'grandTotal', label: 'Amount', width: '120px', type: 'currency', align: 'right' },
    { key: 'totalTax', label: 'Tax', width: '120px', type: 'currency', align: 'right' },
    { key: 'totalDiscount', label: "Dis", width: '120px', type: 'currency', align: 'right' },
    { key: 'totalDiscountPer', label: "Dis %", width: '120px', type: 'currency', align: 'right' },
    { key: 'status', label: 'Status', width: '140px', type: 'badge' },
    { key: 'actions', label: 'Actions', width: '120px', type: 'action', align: 'center', sortable: false }
];

//stock Adjustment
export const STOCK_ADJUSTMENT_COLUMNS: TableColumn[] = [
    { key: 'adjustmentNumber', label: 'Adjustment Id', width: '140px', type: 'link' },
    { key: 'adjustmentDate', label: 'Date', width: '100px', type: 'date' },
    { key: 'status', label: 'Status', width: '130px', type: 'badge', align: 'center' },
    { key: 'reference', label: 'Referance ID', width: '120px', type: 'text', align: 'right' },
    { key: 'totalItems', label: 'Total items', width: '120px', type: 'text', align: 'right' },
    { key: 'actions', label: 'Actions', width: '120px', type: 'action', align: 'center', sortable: false }
];