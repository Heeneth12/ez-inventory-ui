import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpService } from "../../layouts/service/http-svc/http.service";


@Injectable({
    providedIn: 'root'
})
export class StockService {

    private static STOCK_BASE_URL = environment.devUrl + '/v1/stock';

    constructor(private httpService: HttpService) { }

    getCurrentStock(page: number, size: number, filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${StockService.STOCK_BASE_URL}/all?page=${page}&size=${size}`, filter, successfn, errorfn);
    }

    getStockTransactions(page: number, size: number, filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${StockService.STOCK_BASE_URL}/ledger?page=${page}&size=${size}`, filter, successfn, errorfn);
    }

    createStockAdjustment(filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${StockService.STOCK_BASE_URL}/adjustment`, filter, successfn, errorfn)
    }

    getStockAdjustment(page: number, size: number, filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${StockService.STOCK_BASE_URL}/adjustment/all?page=${page}&size=${size}`, filter, successfn, errorfn)
    }
}