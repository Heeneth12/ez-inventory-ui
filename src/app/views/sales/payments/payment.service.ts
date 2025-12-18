import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment.development";
import { HttpService } from "../../../layouts/service/http-svc/http.service";
import { InvoiceService } from "../invoices/invoice.service";



@Injectable({
    providedIn: 'root'
})
export class PaymentService {

    private static PAYMENT_BASE_URL = environment.devUrl + '/v1/payment';

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

    /**
     * Download Payment Receipt PDF
     * Note: For PDFs, you usually need to handle the blob response.
     * If your httpService.getHttp doesn't support blobs, you might need a native HttpClient call.
     */
    downloadPaymentPdf(paymentId: number | string, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${PaymentService.PAYMENT_BASE_URL}/${paymentId}/pdf`, successfn, errorfn);
    }
}