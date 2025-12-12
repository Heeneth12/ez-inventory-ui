import { Injectable } from "@angular/core";
import { HttpService } from "../../../layouts/service/http-svc/http.service";
import { environment } from "../../../../environments/environment.development";
import { SalesOrderService } from "../sales-order/sales-order.service";



@Injectable({
    providedIn: 'root'
})
export class SalesReturnService {

    private static SALES_RETURN_BASE_URL = environment.devUrl + '/v1/sales/return';

    constructor(private httpService: HttpService) { }

    createSalesReturn(salesReturn: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${SalesReturnService.SALES_RETURN_BASE_URL}`, salesReturn, successfn, errorfn);
    }

    updateSalesReturn(id: number, salesReturn: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${SalesReturnService.SALES_RETURN_BASE_URL}/${id}/update`, salesReturn, successfn, errorfn);
    }

    getAllSalesReturns(page: number, size: number, filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${SalesReturnService.SALES_RETURN_BASE_URL}/all?page=${page}&size=${size}`, filter, successfn, errorfn);
    }

    getSalesReturnById(id: number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${SalesReturnService.SALES_RETURN_BASE_URL}/${id}`, successfn, errorfn);
    }
}