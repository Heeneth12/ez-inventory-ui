import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment.development";
import { HttpService } from "../../../layouts/service/http-svc/http.service";
import { ItemService } from "../../items/item.service";
import { ItemModel } from "../../items/models/Item.model";
import { ShipmentStatus } from "./delivery.model";


@Injectable({
    providedIn: 'root'
})
export class DeliveryService {

    private static DELIVERIES_BASE_URL = environment.devUrl + '/v1/delivery';

    constructor(private httpService: HttpService) { }

    getAllDeliveries(page: number, size: number, filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${DeliveryService.DELIVERIES_BASE_URL}/all?page=${page}&size=${size}`, filter, successfn, errorfn);
    }

    getDeliveryById(id: string, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${DeliveryService.DELIVERIES_BASE_URL}/${id}`, successfn, errorfn);
    }

    searchDeliveryDetails(searchFilter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${DeliveryService.DELIVERIES_BASE_URL}/search`, searchFilter, successfn, errorfn);
    }

    updateDeliveryStatus(id: string | number, data: any, file: File | null, successfn: any, errorfn: any) {
        return this.httpService.postMultipartHttp(`${DeliveryService.DELIVERIES_BASE_URL}/${id}/status`, data, file, successfn, errorfn);
    }

    getAllRoutes(page: number, size: number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${DeliveryService.DELIVERIES_BASE_URL}/route/all?page=${page}&size=${size}`, successfn, errorfn);
    }


    createRoute(data: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${DeliveryService.DELIVERIES_BASE_URL}/route`, data, successfn, errorfn);
    }

    getRouteDetails(routeId: string | number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${DeliveryService.DELIVERIES_BASE_URL}/route/${routeId}`, successfn, errorfn);

    }

    startRoute(routeId: number | string, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${DeliveryService.DELIVERIES_BASE_URL}/route/start/${routeId}`, {}, successfn, errorfn);
    }


    completeRoute(routeId: number | string, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${DeliveryService.DELIVERIES_BASE_URL}/route/complete/${routeId}`, {}, successfn, errorfn);
    }

    getRouteSummary(successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${DeliveryService.DELIVERIES_BASE_URL}/route/summary`, successfn, errorfn)
    }

    getBulkDeliveryItems(filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${DeliveryService.DELIVERIES_BASE_URL}/bulk-items`, filter, successfn, errorfn);
    }

    /**
     * DOWNLOAD EXCEL
     * Calls POST /bulk/download with filter criteria
     */
    downloadBulkDeliveryItemsExcel(filter: any, successCallback?: any, errorCallback?: any) {
        const url = DeliveryService.DELIVERIES_BASE_URL + '/bulk-items/download';

        this.httpService.postHttpBlob(url, filter,
            (blob: Blob) => {
                this.httpService.downloadFile(blob, "bulk_delivery_items.xlsx");
                if (successCallback) successCallback();
            },
            (error: any) => {
                if (errorCallback) errorCallback(error);
            }
        );
    }
}