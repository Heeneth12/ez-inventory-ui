import { Injectable } from "@angular/core";
import { HttpService } from "../../layouts/service/http-svc/http.service";
import { CreateUserModel } from "./models/create-user.model";


@Injectable({
    providedIn: 'root'
})
export class UserManagementService {

    private static BASE_URL = "http://localhost:8080";

    private static USER_MANAG_BASE_URL = UserManagementService.BASE_URL + '/api/v1/common';
    private static USER_BASE_URL = UserManagementService.BASE_URL + '/api/v1/user';
    private static TENANT_BASE_URL = UserManagementService.BASE_URL + '/api/v1/tenant';


    constructor(private httpService: HttpService) { }

    getAllApplications(successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${UserManagementService.USER_MANAG_BASE_URL}/app/all`, successfn, errorfn);
    }

    getAllRoles(successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${UserManagementService.USER_MANAG_BASE_URL}/role/all`, successfn, errorfn);
    }

    createRole(requestBody: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${UserManagementService.USER_MANAG_BASE_URL}/role/create`, requestBody, successfn, errorfn);
    }

    getUserById(id: number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${UserManagementService.USER_BASE_URL}/${id}`, successfn, errorfn);
    }

    getModulesByApplication(appId: number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${UserManagementService.USER_MANAG_BASE_URL}/apps/${appId}/modules`, successfn, errorfn);
    }

    getPrivilegesByModule(moduleId: number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${UserManagementService.USER_MANAG_BASE_URL}/modules/${moduleId}/privileges`, successfn, errorfn);
    }

    getAllUsers(successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${UserManagementService.USER_BASE_URL}/all`, successfn, errorfn);
    }

    createUser(requestBody: CreateUserModel, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${UserManagementService.USER_BASE_URL}/create`, requestBody, successfn, errorfn);
    }

    updateUser(requestBody: any, id: number, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${UserManagementService.USER_BASE_URL}/${id}/update`, requestBody, successfn, errorfn);
    }

    //tenants
    createTenant(filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${UserManagementService.TENANT_BASE_URL}/register`, filter, successfn, errorfn);
    }

    getAllTenants(page: number, size: number, filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${UserManagementService.TENANT_BASE_URL}/all?page=${page}&size=${size}`, filter, successfn, errorfn);
    }
}