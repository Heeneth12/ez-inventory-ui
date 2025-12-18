import { ContactMiniModel } from "../../contacts/contacts.model";

export interface InvoicePaymentSummaryModal {
    id: number;
    invoiceId: number;
    invoiceNumber: string;
    customerId: number;
    customerName: string;
    invoiceDate: Date;
    status: string; // PAID, PARTIALLY_PAID, PENDING
    grandTotal: number;   // Total Bill Amount
    totalPaid: number;    // How much received so far
    balanceDue: number;   // Remaining to be paid
    paymentHistory: InvoicePaymentHistoryModal[];
}

export interface InvoicePaymentHistoryModal {
    id: number;
    paymentId: number;
    paymentNumber: string;
    paymentDate: Date;
    amount: number;
    method: string;
    referenceNumber: string;
    remarks: string;
}

export interface PaymentCreateModal {
    customerId: number;
    totalAmount: number;
    paymentMethod: string;
    referenceNumber: string;
    remarks: string;
    allocations: PaymentAllocationModal[];
}

export interface PaymentAllocationModal {
    invoiceId: number;
    amountToPay: number;
}

export interface PaymentModal {
    id: number;
    paymentNumber: string;
    contactMini: ContactMiniModel;
    customerId: number;
    customerName: string;
    paymentDate: Date;
    amount: number;
    status: string;
    paymentMethod: string;
    referenceNumber: string;
    bankName: string;
    remarks: string;
    allocatedAmount: number;
    unallocatedAmount: number;
}
export interface CustomerFinancialSummaryModal {
    customerId: number;
    customerName: string;
    totalOutstandingAmount: number;
    walletBalance: number;
}

export interface WalletApplyModal {
    paymentId: number;
    invoiceId: number;
    amount: number;
}