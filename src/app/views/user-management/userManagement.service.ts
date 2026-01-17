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


    // tenants
    createTenant(filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${UserManagementService.TENANT_BASE_URL}/register`, filter, successfn, errorfn);
    }

    updateTenant(tenantId: number, data: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${UserManagementService.TENANT_BASE_URL}/${tenantId}/update`, data, successfn, errorfn);
    }


    getAllTenants(page: number, size: number, filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${UserManagementService.TENANT_BASE_URL}/all?page=${page}&size=${size}`, filter, successfn, errorfn);
    }

    getTenantById(tenantId: number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${UserManagementService.TENANT_BASE_URL}/${tenantId}`, successfn, errorfn);
    }

    // users
    createUser(requestBody: CreateUserModel, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${UserManagementService.USER_BASE_URL}/create`, requestBody, successfn, errorfn);
    }

    updateUser(requestBody: any, id: number, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${UserManagementService.USER_BASE_URL}/${id}/update`, requestBody, successfn, errorfn);
    }

    getAllUsers(page: number, size: number, filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${UserManagementService.USER_BASE_URL}/all?page=${page}&size=${size}`, filter, successfn, errorfn);
    }

    getUserById(id: number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${UserManagementService.USER_BASE_URL}/${id}`, successfn, errorfn);
    }

    deleteUser(id: number, successfn: any, errorfn: any) {
        return this.httpService.deleteHttp(`${UserManagementService.USER_BASE_URL}/${id}`, successfn, errorfn);
    }


    // common / REFERENCE
    getAllApplications(successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${UserManagementService.USER_MANAG_BASE_URL}/app/all`, successfn, errorfn);
    }

    getAllRoles(successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${UserManagementService.USER_MANAG_BASE_URL}/role/all`, successfn, errorfn);
    }

    createRole(requestBody: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${UserManagementService.USER_MANAG_BASE_URL}/role/create`, requestBody, successfn, errorfn);
    }

    getModulesByApplication(appId: number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${UserManagementService.USER_MANAG_BASE_URL}/apps/${appId}/modules`, successfn, errorfn);
    }

    getPrivilegesByModule(moduleId: number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${UserManagementService.USER_MANAG_BASE_URL}/modules/${moduleId}/privileges`, successfn, errorfn);
    }
}