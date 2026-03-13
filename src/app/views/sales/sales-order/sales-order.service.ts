import { Injectable } from "@angular/core";
import { HttpService } from "../../../layouts/service/http-svc/http.service";
import { environment } from "../../../../environments/environment.development";
import { filter } from "rxjs";



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

    searchSalesOrders(filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${SalesOrderService.SALES_ORDER_BASE_URL}/search`, filter, successfn, errorfn);
    }

    updateSalesOrderStatus(id: number, status: string, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${SalesOrderService.SALES_ORDER_BASE_URL}/${id}/status?status=${status}`, null, successfn, errorfn);
    }

    getSalesOrderStats(filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${SalesOrderService.SALES_ORDER_BASE_URL}/stats`, filter, successfn, errorfn);
    }

    //reports
    downloadSalesOrdersExcel(filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${SalesOrderService.SALES_ORDER_BASE_URL}/download`, filter, successfn, errorfn);
    }

    getSalesOrderConversionReport(filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${SalesOrderService.SALES_ORDER_BASE_URL}/conversion-report`, filter, successfn, errorfn);
    }

    /**
     * DOWNLOAD EXCEL
     * Calls POST /bulk/download with filter criteria
     */
    bulkSalesOrderDownload(filter: any, successCallback?: any, errorCallback?: any) {
        const url = SalesOrderService.SALES_ORDER_BASE_URL + '/bulk/download';

        this.httpService.postHttpBlob(url, filter,
            (blob: Blob) => {
                this.httpService.downloadFile(blob, "sales_orders.xlsx");
                if (successCallback) successCallback();
            },
            (error: any) => {
                if (errorCallback) errorCallback(error);
            }
        );
    }
}