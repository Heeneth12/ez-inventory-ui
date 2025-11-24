import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpService } from "../../layouts/service/http-svc/http.service";


@Injectable({
    providedIn: 'root'
})
export class UserManagementService {

    private static ITEMS_BASE_URL = environment.devUrl + '/v1/auth';

    constructor(private httpService: HttpService) { }


}