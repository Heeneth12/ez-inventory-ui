import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment.development";
import { HttpService } from "../../../layouts/service/http-svc/http.service";



@Injectable({
    providedIn: 'root'
})
export class InvoiceService {

    private static INVOICE_BASE_URL = environment.devUrl + '/v1/invoice';

    constructor(private httpService: HttpService) { }

    createInvoice(data: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${InvoiceService.INVOICE_BASE_URL}`, data, successfn, errorfn)
    }

    updateInvoice(id: number, data: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${InvoiceService.INVOICE_BASE_URL}/${id}/update`, data, successfn, errorfn)
    }

    getInvoices(page: number, size: number, filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${InvoiceService.INVOICE_BASE_URL}/all?page=${page}&size=${size}`, filter, successfn, errorfn);
    }

    getInvoiceById(id: number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${InvoiceService.INVOICE_BASE_URL}/${id}`, successfn, errorfn);
    }
}