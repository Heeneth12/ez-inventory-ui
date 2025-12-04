import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpService } from "../../layouts/service/http-svc/http.service";
import { CreateUserModel } from "./models/create-user.model";


@Injectable({
    providedIn: 'root'
})
export class UserManagementService {

    private static ITEMS_BASE_URL = environment.devUrl + '/api/v1/common';
    private static USER_BASE_URL = environment.devUrl + '/api/v1/user';

    constructor(private httpService: HttpService) { }

    getAllApplications(successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${UserManagementService.ITEMS_BASE_URL}/app/all`, successfn, errorfn);
    }

    getAllRoles(successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${UserManagementService.ITEMS_BASE_URL}/role/all`, successfn, errorfn);
    }

    createRole(requestBody: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${UserManagementService.ITEMS_BASE_URL}/role/create`, requestBody, successfn, errorfn);
    }

    getModulesByApplication(appId: number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${UserManagementService.ITEMS_BASE_URL}/apps/${appId}/modules`, successfn, errorfn);
    }

    getPrivilegesByModule(moduleId: number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${UserManagementService.ITEMS_BASE_URL}/modules/${moduleId}/privileges`, successfn, errorfn);
    }

    getAllUsers(successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${UserManagementService.USER_BASE_URL}/all`, successfn, errorfn);
    }

    createUser(requestBody: CreateUserModel, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${UserManagementService.USER_BASE_URL}/create`, requestBody, successfn, errorfn);
    }

    updateUser(requestBody: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${UserManagementService.USER_BASE_URL}/update`, requestBody, successfn, errorfn);
    }
}