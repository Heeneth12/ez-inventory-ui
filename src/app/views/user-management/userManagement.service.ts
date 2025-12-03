import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
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

// create user request body example
// {
//   "fullName": "John Doe",
//   "email": "john@mail.com",
//   "phone": "9876543210",
//   "password": "Default@123",
//   "tenantId": 1,
//   "roleIds": [2, 3],
//   "applicationIds": [1, 4],
//   "privilegeMapping": [
//     {
//       "applicationId": 1,
//       "moduleId": 10,
//       "privilegeIds": [101, 102, 103]
//     }
//   ]
// }
