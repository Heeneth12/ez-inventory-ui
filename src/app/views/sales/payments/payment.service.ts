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

    getPaymentSummaryByInvoiceId(id: string|  number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${PaymentService.PAYMENT_BASE_URL}/invoice/${id}/summary`, successfn, errorfn);
    }

    getPagetPaymentSummaryById(id: string|  number, successfn: any, errorfn: any){
         return this.httpService.getHttp(`${PaymentService.PAYMENT_BASE_URL}?paymentId=${id}`, successfn, errorfn);
    }

    getPayments(page: number, size: number, filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${PaymentService.PAYMENT_BASE_URL}/all?page=${page}&size=${size}`, filter, successfn, errorfn);
    }

    getPaymentById(id: string| number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${PaymentService.PAYMENT_BASE_URL}/${id}`, successfn, errorfn);
    }
}