import { Injectable } from "@angular/core";
import { HttpService } from "../../layouts/service/http-svc/http.service";
import { environment } from "../../../environments/environment.development";
import { ItemModel } from "./models/Item.model";


@Injectable({
    providedIn: 'root'
})
export class ItemService {

    private static ITEMS_BASE_URL = environment.devUrl + '/v1/items';

    constructor(private httpService: HttpService) { }

    createItem(item: ItemModel, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${ItemService.ITEMS_BASE_URL}`, item, successfn, errorfn);
    }

    getAllItems(page: number, size: number, filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${ItemService.ITEMS_BASE_URL}/all?page=${page}&size=${size}`, filter, successfn, errorfn);
    }

    getItemById(id: string, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${ItemService.ITEMS_BASE_URL}/${id}`, successfn, errorfn);
    }

    updateItem(id: string, item: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${ItemService.ITEMS_BASE_URL}/${id}/update`, item, successfn, errorfn);
    }

    toggleItemActiveStatus(id: string, active: boolean, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${ItemService.ITEMS_BASE_URL}/${id}/status?active=${active}`, null, successfn, errorfn);
    }

    searchItems(searchFilter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${ItemService.ITEMS_BASE_URL}/search`, searchFilter, successfn, errorfn);
    }
}