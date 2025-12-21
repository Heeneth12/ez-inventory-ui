import { TableColumn } from "../components/standard-table/standard-table.model";

//Items
export const ITEMS_COLUMNS: TableColumn[] = [
    { key: 'id', label: 'ID', width: '60px', align: 'center', type: 'text' },
    { key: 'name', label: 'Item Name', width: '230px', type: 'text' },
    { key: 'itemCode', label: 'Code', width: '110px', type: 'text' },
    { key: 'sku', label: 'SKU', width: '110px', type: 'text' },
    { key: 'itemType', label: 'Type', width: '100px', type: 'badge' },
    { key: 'unitOfMeasure', label: 'Unit', width: '90px', type: 'text' },
    { key: 'mrp', label: 'MRP', align: 'right', width: '110px', type: 'currency' },
    { key: 'purchasePrice', label: 'PP', align: 'right', width: '130px', type: 'currency' },
    { key: 'sellingPrice', label: 'SP', align: 'right', width: '110px', type: 'currency' },
    { key: 'hsnSacCode', label: 'HSN/SAC', align: "center", width: '110px', type: 'text' },
    { key: 'isActive', label: 'Active', align: 'center', width: '80px', type: 'toggle' },
    { key: 'actions', label: 'Actions', align: 'center', width: '120px', type: 'action', sortable: false }
];

//stock
export const STOCK_COLUMNS: TableColumn[] = [
    { key: 'id', label: 'ID', width: '60px', align: 'center', type: 'text' },
    { key: 'itemId', label: 'Item ID', width: '100px', type: 'text' },
    { key: 'itemName', label: 'Item Name', width: '200px', type: 'text' },
    { key: 'warehouseId', label: 'Warehouse', width: '110px', type: 'text' },
    { key: 'openingQty', label: 'Opening Qty', align: 'right', width: '120px', type: 'number' },
    { key: 'inQty', label: 'In Qty', align: 'right', width: '100px', type: 'number' },
    { key: 'outQty', label: 'Out Qty', align: 'right', width: '100px', type: 'number' },
    { key: 'closingQty', label: 'Closing Qty', align: 'right', width: '120px', type: 'number' },
    { key: 'averageCost', label: 'Avg Cost', align: 'right', width: '120px', type: 'currency' },
    { key: 'stockValue', label: 'Stock Value', align: 'right', width: '140px', type: 'currency' },
    { key: 'actions', label: 'Actions', align: 'center', width: '120px', type: 'action', sortable: false }
];

//sales order
export const SALES_ORDER_COLUMNS: TableColumn[] = [
    { key: 'contactMini', label: 'Customer', width: '140px', type: 'fullProfile', align: 'left' },
    { key: 'orderNumber', label: 'Order No', width: '130px', type: 'link' },
    { key: 'source', label: 'Source', width: '100px', type: 'badge' },
    { key: 'orderDate', label: 'Order Date', width: '130px', type: 'date', align: 'center' },
    { key: 'grandTotal', label: 'Amount', width: '120px', type: 'currency', align: 'right' },
    { key: 'totalTax', label: 'Tax', width: '120px', type: 'currency', align: 'right' },
    { key: 'totalDiscount', label: "Dis", width: '120px', type: 'currency', align: 'right' },
    { key: 'totalDiscountPer', label: "Dis %", width: '80px', type: 'text', align: 'center' },
    { key: 'status', label: 'Status', width: '140px', type: 'badge' },
    { key: 'actions', label: 'Actions', width: '120px', type: 'action', align: 'center', sortable: false }
];

//Invoice
export const INVOICE_COLUMNS: TableColumn[] = [
    { key: 'contactMini', label: 'Customer', width: '140px', type: 'fullProfile', align: 'left' },
    { key: 'invoiceNumber', label: 'Invoice No', width: '130px', type: 'link' },
    { key: 'invoiceDate', label: 'Inv-Date', width: '130px', type: 'date', align: 'center' },
    { key: 'grandTotal', label: 'Amount', width: '120px', type: 'currency', align: 'right' },
    { key: 'totalDiscount', label: "Dis %", width: '120px', type: 'currency', align: 'right' },
    { key: 'status', label: 'Status', width: '140px', type: 'badge' },
    { key: 'paymentStatus', label: 'Pay-Status', width: '140px', type: 'badge' },
    { key: 'amountPaid', label: 'Paid Amt', width: '130px', type: 'currency', align: 'right' },
    { key: 'balance', label: 'Balance', width: '130px', type: 'currency', align: 'right' },
    { key: 'grandTotal', label: 'Total Amt', width: '130px', type: 'currency', align: 'right' },
    { key: 'actions', label: 'Actions', width: '120px', type: 'action', align: 'center', sortable: false }
];


//delivery
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

//Payments
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

//stock Adjustment
export const STOCK_ADJUSTMENT_COLUMNS: TableColumn[] = [
    { key: 'adjustmentNumber', label: 'Adjustment Id', width: '140px', type: 'link' },
    { key: 'adjustmentDate', label: 'Date', width: '100px', type: 'date' },
    { key: 'status', label: 'Status', width: '130px', type: 'badge', align: 'center' },
    { key: 'reference', label: 'Referance ID', width: '120px', type: 'text', align: 'right' },
    { key: 'totalItems', label: 'Total items', width: '120px', type: 'text', align: 'right' },
    { key: 'actions', label: 'Actions', width: '120px', type: 'action', align: 'center', sortable: false }
];

//contact
export const CONTACT_COLUMNS: TableColumn[] = [
    { key: 'id', label: 'ID', width: '60px', align: 'center', type: 'text' },
    { key: 'name', label: 'Contact Profile', width: '280px', type: 'profile' },
    { key: 'contactCode', label: 'Contact Code', type: 'text' },
    { key: 'type', label: 'Type', type: 'badge' },
    { key: 'phone', label: 'Contact Number', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'active', label: 'Active', align: 'center', width: '80px', type: 'toggle' },
    { key: 'actions', label: 'Actions', align: 'center', width: '120px', type: 'action', sortable: false }
];

//approvel
export const APPROVAL_COLUMN: TableColumn[] = [
    { key: 'id', label: 'ID', width: '60px', align: 'center', type: 'text' },
    { key: 'approvalType', label: 'Approval Type', width: '230px', type: 'text' },
    { key: 'referenceCode', label: 'Ref', width: '110px', type: 'text' },
    { key: 'createdAt', label: 'Date', align: 'right', width: '130px', type: 'date' },
    { key: 'valueAmount', label: 'Value', align: 'right', width: '110px', type: 'currency' },
    { key: 'status', label: 'Status', align: 'center', width: '100px', type: 'badge' },
    { key: 'actions', label: 'Actions', align: 'center', width: '120px', type: 'action', sortable: false }
];