import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpService } from "../../layouts/service/http-svc/http.service";

@Injectable({
    providedIn: 'root'
})
export class PaymentService {

    private static PAYMENT_BASE_URL = environment.devUrl + '/v1/payment';
    private static RAZORPAY_BASE_URL = environment.devUrl + '/v1/razorpay';
    private static ADVANCE_BASE_URL = environment.devUrl + '/v1/advance';
    private static CREDIT_NOTE_BASE_URL = environment.devUrl + '/v1/credit-note';

    constructor(private httpService: HttpService) { }

    recordPayment(data: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${PaymentService.PAYMENT_BASE_URL}`, data, successfn, errorfn)
    }

    getPaymentsByInvoiceId(id: number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${PaymentService.PAYMENT_BASE_URL}/${id}`, successfn, errorfn)
    }

    getAllPayments(page: number, size: number, filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${PaymentService.PAYMENT_BASE_URL}/all?page=${page}&size=${size}`, filter, successfn, errorfn);
    }

    getPaymentSummaryByInvoiceId(id: string | number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${PaymentService.PAYMENT_BASE_URL}/invoice/${id}/summary`, successfn, errorfn);
    }

    getPagetPaymentSummaryById(id: string | number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${PaymentService.PAYMENT_BASE_URL}?paymentId=${id}`, successfn, errorfn);
    }

    getPayments(page: number, size: number, filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${PaymentService.PAYMENT_BASE_URL}/all?page=${page}&size=${size}`, filter, successfn, errorfn);
    }

    getPaymentById(id: string | number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${PaymentService.PAYMENT_BASE_URL}/${id}`, successfn, errorfn);
    }

    /**
     * Get summary of customer's total due and wallet (unallocated) balance
     */
    getCustomerSummary(customerId: number | string, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${PaymentService.PAYMENT_BASE_URL}/summary/customer/${customerId}`, successfn, errorfn);
    }

    /**
     * Download Payment Receipt PDF
     */
    downloadPaymentPdf(paymentId: number | string, successfn: any, errorfn: any) {
        return this.httpService.getFile(`${PaymentService.PAYMENT_BASE_URL}/${paymentId}/pdf`, successfn, errorfn);
    }

    // ─── Razorpay ──────────────────────────────────────────────────────────────

    /**
     * Dynamically loads the Razorpay Checkout script.
     * Safe to call multiple times — skips if already loaded.
     */
    loadRazorpayScript(): Promise<boolean> {
        return new Promise(resolve => {
            if ((window as any).Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => resolve(true);
            script.onerror = () => {
                console.error('Failed to load Razorpay checkout script');
                resolve(false);
            };
            document.body.appendChild(script);
        });
    }

    /**
     * Step 1 — Ask backend to create a Razorpay order.
     * Backend calls Razorpay API, stores the order, and returns the order details.
     *
     * Expected request body:
     *   { invoiceId, customerId, amount }   (amount in INR, backend converts to paise)
     */
    /**
     * Step 1 — Create a Razorpay order.
     * data must include: { customerId, amount, paymentMethod: 'UPI'|'QR'|'NET_BANKING',
     *   upiId? (UPI), bankCode? (NET_BANKING), allocations?: [{invoiceId, amountToPay}] }
     */
    createRazorpayOrder(data: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(
            `${PaymentService.RAZORPAY_BASE_URL}/order`,
            data,
            successfn,
            errorfn
        );
    }

    /**
     * Step 2 — Verify signature and record payment.
     * data: { razorpayOrderId, razorpayPaymentId, razorpaySignature,
     *   customerId, amount, allocations, qrCodeId? }
     */
    verifyRazorpayPayment(data: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(
            `${PaymentService.RAZORPAY_BASE_URL}/verify`,
            data,
            successfn,
            errorfn
        );
    }

    /**
     * Send a generated payment link to a customer via email.
     * data: { paymentLinkId, paymentLinkUrl, email, customerId, invoiceId? }
     */
    sendPaymentLinkEmail(data: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(
            `${PaymentService.RAZORPAY_BASE_URL}/payment-link/send-email`,
            data,
            successfn,
            errorfn
        );
    }

    // ─── Advance ────────────────────────────────────────────────────────────────

    createAdvance(data: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${PaymentService.ADVANCE_BASE_URL}`, data, successfn, errorfn);
    }

    getAllAdvances(page: number, size: number, filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${PaymentService.ADVANCE_BASE_URL}/all?page=${page}&size=${size}`, filter, successfn, errorfn);
    }

    utilizeAdvance(data: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${PaymentService.ADVANCE_BASE_URL}/utilize`, data, successfn, errorfn);
    }

    refundAdvance(data: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${PaymentService.ADVANCE_BASE_URL}/refund`, data, successfn, errorfn);
    }

    confirmAdvanceRefund(refundId: number | string, successfn: any, errorfn: any) {
        return this.httpService.patchHttp(`${PaymentService.ADVANCE_BASE_URL}/refund/${refundId}/confirm`, {}, successfn, errorfn);
    }

    getAdvance(advanceId: number | string, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${PaymentService.ADVANCE_BASE_URL}/${advanceId}`, successfn, errorfn);
    }

    getAdvancesByCustomer(customerId: number | string, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${PaymentService.ADVANCE_BASE_URL}/customer/${customerId}`, successfn, errorfn);
    }

    // ─── Credit Note ────────────────────────────────────────────────────────────

    utilizeCreditNote(data: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${PaymentService.CREDIT_NOTE_BASE_URL}/utilize`, data, successfn, errorfn);
    }

    getAllCreditNotes(page: number, size: number, filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${PaymentService.CREDIT_NOTE_BASE_URL}/all?page=${page}&size=${size}`, filter, successfn, errorfn);
    }

    refundCreditNote(data: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${PaymentService.CREDIT_NOTE_BASE_URL}/refund`, data, successfn, errorfn);
    }

    confirmCreditNoteRefund(refundId: number | string, successfn: any, errorfn: any) {
        return this.httpService.patchHttp(`${PaymentService.CREDIT_NOTE_BASE_URL}/refund/${refundId}/confirm`, {}, successfn, errorfn);
    }

    getCreditNote(creditNoteId: number | string, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${PaymentService.CREDIT_NOTE_BASE_URL}/${creditNoteId}`, successfn, errorfn);
    }

    getCreditNotesByCustomer(customerId: number | string, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${PaymentService.CREDIT_NOTE_BASE_URL}/customer/${customerId}`, successfn, errorfn);
    }

    /**
     * Poll the status of a Razorpay order (used for QR and payment link).
     * Returns { status: 'CREATED' | 'PAID' | 'captured' }
     */
    checkOrderStatus(orderId: string, successfn: any, errorfn: any) {
        return this.httpService.getHttp(
            `${PaymentService.RAZORPAY_BASE_URL}/order/${orderId}/status`,
            successfn,
            errorfn
        );
    }

    /**
     * List all Razorpay transactions for a given invoice.
     * Returns paginated RazorpayTransaction rows (CREATED / PAID / FAILED / EXPIRED).
     */
    getRazorpayTransactions(invoiceId: number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(
            `${PaymentService.RAZORPAY_BASE_URL}/transactions?invoiceId=${invoiceId}&size=50`,
            successfn,
            errorfn
        );
    }
}