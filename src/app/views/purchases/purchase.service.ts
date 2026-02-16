import { Injectable } from "@angular/core";
import { HttpService } from "../../layouts/service/http-svc/http.service";
import { environment } from "../../../environments/environment.development";


@Injectable({
    providedIn: 'root'
})
export class PurchaseService {

    private static PURCHASE_REQUEST_BASE_URL = environment.devUrl + '/v1/prq'
    private static PURCHASE_ORDER_BASE_URL = environment.devUrl + '/v1/purchaseorder';
    private static GRN_BASE_URL = environment.devUrl + '/v1/grn';
    private static PURCHASE_RETURN_BASE_URL = environment.devUrl + '/v1/purchasereturn';

    constructor(private httpService: HttpService) { }

    // PRQ
    createPrq(request: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(PurchaseService.PURCHASE_REQUEST_BASE_URL, request, successfn, errorfn);
    }

    getPrqById(prqId: number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${PurchaseService.PURCHASE_REQUEST_BASE_URL}/${prqId}`, successfn, errorfn);
    }

    getAllPrqs(page: number, size: number, filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${PurchaseService.PURCHASE_REQUEST_BASE_URL}/all?page=${page}&size=${size}`, filter, successfn, errorfn);
    }

    updatePrq(prqId: number, request: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${PurchaseService.PURCHASE_REQUEST_BASE_URL}/${prqId}/update`, request, successfn, errorfn);
    }

    updatePrqStatus(prqId: number, status: string, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${PurchaseService.PURCHASE_REQUEST_BASE_URL}/${prqId}/status?status=${status}`, {}, successfn, errorfn);
    }

    // PO
    createPO(request: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(PurchaseService.PURCHASE_ORDER_BASE_URL, request, successfn, errorfn);
    }

    getPoById(poId: number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${PurchaseService.PURCHASE_ORDER_BASE_URL}/${poId}`, successfn, errorfn);
    }

    getAllPo(page: number, size: number, filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${PurchaseService.PURCHASE_ORDER_BASE_URL}/all?page=${page}&size=${size}`, filter, successfn, errorfn);
    }

    updatePo(poId: number, request: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${PurchaseService.PURCHASE_ORDER_BASE_URL}/${poId}/update`, request, successfn, errorfn);
    }

    updatePoSatus(poId: number, status: string, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${PurchaseService.PURCHASE_ORDER_BASE_URL}/${poId}/status?status=${status}`, {}, successfn, errorfn);
    }

    // GRN
    createGrn(request: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(PurchaseService.GRN_BASE_URL, request, successfn, errorfn);
    }

    getAllGrn(page: number, size: number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${PurchaseService.GRN_BASE_URL}?page=${page}&size=${size}`, successfn, errorfn);
    }

    getGrnDetails(grnId: number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${PurchaseService.GRN_BASE_URL}/${grnId}`, successfn, errorfn);
    }

    getGrnHistoryForPo(poId: number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${PurchaseService.GRN_BASE_URL}/po/${poId}`, successfn, errorfn);
    }

    // PR
    createPurchaseReturn(request: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(PurchaseService.PURCHASE_RETURN_BASE_URL, request, successfn, errorfn);
    }

    updatePurchaseReturn(returnId: number, request: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${PurchaseService.PURCHASE_RETURN_BASE_URL}/${returnId}/update`, request, successfn, errorfn);
    }

    updatePurchaseReturnStatus(returnId: number, status: string, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${PurchaseService.PURCHASE_RETURN_BASE_URL}/${returnId}/status?status=${status}`, {}, successfn, errorfn);
    }

    getReturnById(returnId: number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${PurchaseService.PURCHASE_RETURN_BASE_URL}/${returnId}`, successfn, errorfn);
    }

    getAllReturns(page: number, size: number, filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${PurchaseService.PURCHASE_RETURN_BASE_URL}/all?page=${page}&size=${size}`, filter, successfn, errorfn);
    }
}
