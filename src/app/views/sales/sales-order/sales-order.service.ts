import { Injectable } from "@angular/core";
import { HttpService } from "../../../layouts/service/http-svc/http.service";
import { environment } from "../../../../environments/environment.development";



@Injectable({
    providedIn: 'root'
})
export class SalesOrderService {

    private static SALES_ORDER_BASE_URL = environment.devUrl + '/v1/sales/order';

    constructor(private httpService: HttpService) { }

    createSalesOrder(salesOrder: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${SalesOrderService.SALES_ORDER_BASE_URL}`, salesOrder, successfn, errorfn);
    }

    updateSalesOrder(id: number, salesOrder: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${SalesOrderService.SALES_ORDER_BASE_URL}/${id}/update`, salesOrder, successfn, errorfn);
    }

    getAllSalesOrders(page: number, size: number, filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${SalesOrderService.SALES_ORDER_BASE_URL}/all?page=${page}&size=${size}`, filter, successfn, errorfn);
    }

    getSalesOrderById(id: number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${SalesOrderService.SALES_ORDER_BASE_URL}/${id}`, successfn, errorfn);
    }

    searchSalesOrders(query: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${SalesOrderService.SALES_ORDER_BASE_URL}/search`, query, successfn, errorfn);
    }

    updateSalesOrderStatus(id: number, status: string, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${SalesOrderService.SALES_ORDER_BASE_URL}/${id}/status?status=${status}`, null, successfn, errorfn);
    }

    getSalesOrderStats(filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${SalesOrderService.SALES_ORDER_BASE_URL}/stats`, filter, successfn, errorfn);
    }
}