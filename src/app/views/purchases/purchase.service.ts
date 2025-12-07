import { Injectable } from "@angular/core";
import { HttpService } from "../../layouts/service/http-svc/http.service";
import { environment } from "../../../environments/environment.development";


@Injectable({
    providedIn: 'root'
})
export class PurchaseService {

    private static PURCHASE_ORDER_BASE_URL = environment.devUrl + '/v1/purchaseorder';
    private static GRN_BASE_URL = environment.devUrl + '/v1/grn';
    private static PURCHASE_RETURN_BASE_URL = environment.devUrl + '/v1/purchasereturn';

    constructor(private httpService: HttpService) { }

    createPO(request: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(PurchaseService.PURCHASE_ORDER_BASE_URL, request, successfn, errorfn);
    }

    getPoById(poId: number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${PurchaseService.PURCHASE_ORDER_BASE_URL}/${poId}`, successfn, errorfn);
    }

    getAllPo(page: number, size: number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${PurchaseService.PURCHASE_ORDER_BASE_URL}?page=${page}&size=${size}`, successfn, errorfn);
    }

    updatePo(poId: number, request: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${PurchaseService.PURCHASE_ORDER_BASE_URL}/${poId}/update`, request, successfn, errorfn);
    }

    cancelPo(poId: number, successfn: any, errorfn: any) {
        return this.httpService.deleteHttp(`${PurchaseService.PURCHASE_ORDER_BASE_URL}/${poId}`, successfn, errorfn);
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

    // PURCHASE RETURN
    createPurchaseReturn(request: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(PurchaseService.PURCHASE_RETURN_BASE_URL, request, successfn, errorfn);
    }

    getReturnById(returnId: number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${PurchaseService.PURCHASE_RETURN_BASE_URL}/${returnId}`, successfn, errorfn);
    }

    getAllReturns(page: number, size: number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${PurchaseService.PURCHASE_RETURN_BASE_URL}?page=${page}&size=${size}`, successfn, errorfn);
    }
}
