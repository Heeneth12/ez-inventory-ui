import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpService } from "../../layouts/service/http-svc/http.service";


@Injectable({
    providedIn: 'root'
})
export class StockService {

    private static STOCK_BASE_URL = environment.devUrl + '/v1/stock';

    constructor(private httpService: HttpService) { }

    /**
     * get current stock
     * 
     * @param page 
     * @param size 
     * @param filter 
     * @param successfn 
     * @param errorfn 
     * @returns 
     */
    getCurrentStock(page: number, size: number, filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${StockService.STOCK_BASE_URL}/all?page=${page}&size=${size}`, filter, successfn, errorfn);
    }

    /**
     * get stock transactions
     * 
     * @param page 
     * @param size 
     * @param filter 
     * @param successfn 
     * @param errorfn 
     * @returns 
     */
    getStockTransactions(page: number, size: number, filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${StockService.STOCK_BASE_URL}/ledger?page=${page}&size=${size}`, filter, successfn, errorfn);
    }

    /**
     * create stock adjustment
     * 
     * @param filter 
     * @param successfn 
     * @param errorfn 
     * @returns 
     */
    createStockAdjustment(filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${StockService.STOCK_BASE_URL}/adjustment`, filter, successfn, errorfn)
    }

    /**
     * get stock adjustment
     * 
     * @param page 
     * @param size 
     * @param filter 
     * @param successfn 
     * @param errorfn 
     * @returns 
     */
    getStockAdjustment(page: number, size: number, filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${StockService.STOCK_BASE_URL}/adjustment/all?page=${page}&size=${size}`, filter, successfn, errorfn)
    }

    /**
     * search items
     * 
     * @param filter 
     * @param successfn 
     * @param errorfn 
     * @returns 
     */
    searchItems(filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${StockService.STOCK_BASE_URL}/search`, filter, successfn, errorfn);
    }

    /**
     * get stock adjustments
     * 
     * @param page 
     * @param size 
     * @param filter 
     * @param successfn 
     * @param errorfn 
     * @returns 
     */
    getStockAdjustments(page: number, size: number, filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${StockService.STOCK_BASE_URL}/adjustment/all?page=${page}&size=${size}`, filter, successfn, errorfn)
    }

    /**
     * get stock adjustment by id
     * 
     * @param id 
     * @param successfn 
     * @param errorfn 
     * @returns 
     */
    getStockAdjustmentById(id: string | number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${StockService.STOCK_BASE_URL}/adjustment/${id}`, successfn, errorfn)
    }

    /**
     * get stock dashboard summary
     * 
     * @param warehouseId 
     * @param successfn 
     * @param errorfn 
     * @returns 
     */
    getStockDashboardSummary(warehouseId: string | number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${StockService.STOCK_BASE_URL}/summary/${warehouseId}`, successfn, errorfn)
    }


    /**
     * update stock
     * 
     * @param stockUpdateDto 
     * @param successfn 
     * @param errorfn 
     * @returns 
     */
    stockUpdate(stockUpdateDto: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${StockService.STOCK_BASE_URL}`, stockUpdateDto, successfn, errorfn);
    }

    /**
     * download stock transactions
     * 
     * @param filter 
     * @param format 
     * @param successfn 
     * @param errorfn 
     * @returns 
     */
    downloadStockTransactions(filter: any, format: string, successfn: any, errorfn: any) {
        return this.httpService.postHttpBlob(`${StockService.STOCK_BASE_URL}/ledger/download?format=${format}`, filter, successfn, errorfn);
    }

    /**
     * update stock adjustment status
     * 
     * @param adjustmentId 
     * @param status 
     * @param successfn 
     * @param errorfn 
     * @returns 
     */
    updateStockAdjustmentStatus(adjustmentId: string | number, status: string, successfn: any, errorfn: any) {
        return this.httpService.patchHttp(`${StockService.STOCK_BASE_URL}/adjustment/${adjustmentId}/status?status=${status}`, {}, successfn, errorfn);
    }

}
