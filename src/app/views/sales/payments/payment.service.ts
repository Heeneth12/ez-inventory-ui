import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment.development";
import { HttpService } from "../../../layouts/service/http-svc/http.service";
import { InvoiceService } from "../invoices/invoice.service";



@Injectable({
    providedIn: 'root'
})
export class PaymentService {

    private static PAYMENT_BASE_URL = environment.devUrl + '/v1/payment';
    private static RAZORPAY_BASE_URL = environment.devUrl + '/v1/razorpay';

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
     * Apply existing wallet/credit balance to a specific invoice
     * data should match WalletApplyDto { paymentId, invoiceId, amount }
     */
    applyWalletToInvoice(data: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${PaymentService.PAYMENT_BASE_URL}/wallet/apply`, data, successfn, errorfn);
    }

    /**
     * Refund an unallocated amount back to the customer
     */
    refundWalletAmount(paymentId: number | string, amount: number, successfn: any, errorfn: any) {
        // Since the backend uses @RequestParam, we append the amount to the URL
        return this.httpService.postHttp(`${PaymentService.PAYMENT_BASE_URL}/wallet/refund/${paymentId}?amount=${amount}`, {}, successfn, errorfn);
    }

    addMoneyToWallet(data: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${PaymentService.PAYMENT_BASE_URL}/wallet/add`, data, successfn, errorfn);
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