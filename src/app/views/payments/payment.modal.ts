import { CommonFilterModel } from "../../layouts/models/common-filter.model";
import { ContactMiniModel } from "../contacts/contacts.model";


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
    customerName?: string;
    totalOutstandingAmount: number;
    walletBalance: number;
    advanceBalance: number;
    creditNoteBalance: number;
}

// ─── Advance ────────────────────────────────────────────────────────────────

export interface AdvanceCreateModal {
    customerId: number;
    amount: number;
    paymentMethod: string;
    referenceNumber?: string;
    bankName?: string;
    remarks?: string;
}

export interface AdvanceModal {
    id: number;
    advanceNumber: string;
    customerId: number;
    customerName: string;
    receivedDate: Date;
    amount: number;
    availableBalance: number;
    paymentMethod: string;
    status: string; // ACTIVE, EXHAUSTED, REFUNDED, PARTIALLY_REFUNDED
    referenceNumber?: string;
    bankName?: string;
    remarks?: string;
    utilizations?: AdvanceUtilizationItem[];
    refunds?: AdvanceRefundItem[];
}

export interface AdvanceUtilizationItem {
    id: number;
    invoiceId: number;
    invoiceNumber: string;
    utilizedAmount: number;
    utilizationDate: Date;
    status: string;
}

export interface AdvanceRefundItem {
    id: number;
    refundNumber: string;
    refundAmount: number;
    refundDate: Date;
    refundMethod: string;
    refundReferenceNumber?: string;
    status: string; // PENDING, CLEARED
}

export interface AdvanceUtilizeModal {
    advanceId: number;
    invoiceId: number;
    amount: number;
    remarks?: string;
}

export interface AdvanceRefundRequestModal {
    advanceId: number;
    refundAmount: number;
    refundMethod: string;
    refundReferenceNumber?: string;
    remarks?: string;
}

// ─── Credit Note ────────────────────────────────────────────────────────────

export interface CreditNoteModal {
    id: number;
    creditNoteNumber: string;
    customerId: number;
    customerName: string;
    sourceReturnId?: number;
    issueDate: Date;
    amount: number;
    availableBalance: number;
    status: string; // ACTIVE, EXHAUSTED, REFUNDED, PARTIALLY_REFUNDED
    remarks?: string;
    utilizations?: CreditNoteUtilizationItem[];
    refunds?: CreditNoteRefundItem[];
}

export interface CreditNoteUtilizationItem {
    id: number;
    invoiceId: number;
    invoiceNumber: string;
    utilizedAmount: number;
    utilizationDate: Date;
    status: string;
}

export interface CreditNoteRefundItem {
    id: number;
    refundNumber: string;
    refundAmount: number;
    refundDate: Date;
    refundMethod: string;
    refundReferenceNumber?: string;
    status: string; // PENDING, CLEARED
}

export interface CreditNoteUtilizeModal {
    creditNoteId: number;
    invoiceId: number;
    amount: number;
    remarks?: string;
}

export interface CreditNoteRefundRequestModal {
    creditNoteId: number;
    refundAmount: number;
    refundMethod: string;
    refundReferenceNumber?: string;
    remarks?: string;
}

export interface WalletApplyModal {
    paymentId: number;
    invoiceId: number;
    amount: number;
}

export class PaymentFilterModal extends CommonFilterModel {
    customerId!: number;
    paymentStatus!: string[];
    paymentMethod!: string[];
}

export interface RazorpayOrderResponse {
    orderId: string;
    currency: string;
    amountInPaise: number;
    razorpayKeyId: string;
    qrImageUrl?: string;
    qrCodeId?: string;
    paymentLinkUrl?: string;
    paymentLinkId?: string;
    status: string;
}
export interface RazorpayVerifyRequest {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    invoiceId: number;
    customerId: number;
    amount: number;
}

export interface RazorpayCheckoutOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    prefill: {
        name: string;
        email: string;
        contact: string;
    };
    notes?: Record<string, string>;
    theme: { color: string };
    handler: (response: RazorpaySuccessResponse) => void;
    modal: {
        ondismiss: () => void;
        escape?: boolean;
        backdropclose?: boolean;
    };
}

/** Razorpay success callback payload */
export interface RazorpaySuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

/** One row from the razorpay_transaction table */
export interface RazorpayTransactionModal {
    id: number;
    razorpayResourceId: string;   // plink_xxx / qr_xxx / order_xxx
    razorpayPaymentId: string;    // pay_xxx — filled after payment
    paymentMethod: string;        // PAYMENT_LINK / QR / CHECKOUT
    amountInPaise: number;
    status: 'CREATED' | 'PAID' | 'FAILED' | 'EXPIRED';
    purpose: 'INVOICE' | 'MULTI_INVOICE' | 'ADVANCE';
    invoiceIds: string;           // "101" or "101,102"
    paymentRecordId: number;      // Payment.id once PAID
    errorDescription: string;
    notes: string;
    createdAt: string;
    updatedAt: string;
}