import { CommonFilterModel } from "../../../layouts/models/common-filter.model";
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