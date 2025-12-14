import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment.development";
import { HttpService } from "../../../layouts/service/http-svc/http.service";
import { ItemService } from "../../items/item.service";
import { ItemModel } from "../../items/models/Item.model";


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

    updateDeliveryStatus(request:any, successfn: any, errorfn: any){
         return this.httpService.postHttp(`${DeliveryService.DELIVERIES_BASE_URL}/update-status`, request, successfn, errorfn);
    }

    markAsDelivered(deliveryId: string | number, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${DeliveryService.DELIVERIES_BASE_URL}/${deliveryId}/delivered`, { deliveryId }, successfn, errorfn);
    }
}