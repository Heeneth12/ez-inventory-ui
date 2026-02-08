import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpService } from "../../layouts/service/http-svc/http.service";
import { PurchaseService } from "../purchases/purchase.service";


@Injectable({
    providedIn: 'root'
})
export class VendorService {

    private static VENDOR_BASE_URL = environment.devUrl + '/v1/prq';

    constructor(private httpService: HttpService) { }

    // PRQ
    getPrqById(prqId: number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${VendorService.VENDOR_BASE_URL}/${prqId}`, successfn, errorfn);
    }

    getAllPrqs(page: number, size: number, filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${VendorService.VENDOR_BASE_URL}/all?page=${page}&size=${size}`, filter, successfn, errorfn);
    }

    updatePrqStatus(prqId: number, status: string, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${VendorService.VENDOR_BASE_URL}/${prqId}/status?status=${status}`, {}, successfn, errorfn);
    }

}