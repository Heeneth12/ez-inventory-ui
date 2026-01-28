import { Injectable } from "@angular/core";
import { HttpService } from "../../layouts/service/http-svc/http.service";
import { environment } from "../../../environments/environment.development";
import { ContactFilter, ContactModel } from "./contacts.model";


@Injectable({
    providedIn: 'root'
})
export class ContactService {

    private static CONTACTS_BASE_URL = environment.devUrl + '/v1/contact';

    constructor(private httpService: HttpService) { }

    createContact(item: ContactModel, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${ContactService.CONTACTS_BASE_URL}`, item, successfn, errorfn);
    }

    updateContact(item: ContactModel, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${ContactService.CONTACTS_BASE_URL}/${item.id}/update`, item, successfn, errorfn);
    }

    getContacts(page: number, size: number, filter: ContactFilter, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${ContactService.CONTACTS_BASE_URL}/all?page=${page}&size=${size}`, filter, successfn, errorfn);
    }

    getContactById(id: number | string, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${ContactService.CONTACTS_BASE_URL}/${id}`, successfn, errorfn);
    }

    toggleContactStatus(id: number, active: boolean, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${ContactService.CONTACTS_BASE_URL}/${id}/status?active=${active}`, null, successfn, errorfn);
    }

    searchContacts(filter: ContactFilter, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${ContactService.CONTACTS_BASE_URL}/search`, filter, successfn, errorfn);
    }

    getMyNetwork(successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${ContactService.CONTACTS_BASE_URL}/network/all`, successfn, errorfn);
    }

    updateNetworkStatus(id: number, status: string, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${ContactService.CONTACTS_BASE_URL}/network/${id}/update?status=${status}`, {}, successfn, errorfn);
    }

    sendNetworkRequest(payload: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${ContactService.CONTACTS_BASE_URL}/network/request`, payload, successfn, errorfn);
    }

    getIncomingRequests(successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${ContactService.CONTACTS_BASE_URL}/network/requests/incoming`, successfn, errorfn);
    }
}