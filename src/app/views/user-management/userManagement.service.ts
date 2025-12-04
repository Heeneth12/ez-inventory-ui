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

//response for getAllApplications
// {
//     "code": 201,
//     "data": [
//         {
//             "id": 1,
//             "appName": "EZH Inventory Management System",
//             "appKey": "EZH_INV_001",
//             "description": "Core inventory management application",
//             "isActive": true
//         }
//     ],
//     "message": "Tenant registered successfully"
// }

//example response for getModulesByApplication
//{
// "code": 200,
// "data": [
//     {
//         "id": 1,
//         "moduleName": "Dashboard",
//         "moduleKey": "EZH_INV_DASHBOARD",
//         "description": "Main system dashboard and analytics",
//         "isActive": true,
//         "privileges": [
//             {
//                 "id": 1,
//                 "privilegeName": "View Dashboard",
//                 "privilegeKey": "EZH_INV_DASHBOARD_VIEW",
//                 "description": "Access dashboard and analytics"
//             }
//         ]
//     },
//     {
//         "id": 2,
//         "moduleName": "Items",
//         "moduleKey": "EZH_INV_ITEMS",
//         "description": "Manage items, categories, pricing",
//         "isActive": true,
//         "privileges": [
//             {
//                 "id": 3,
//                 "privilegeName": "Create Item",
//                 "privilegeKey": "EZH_INV_ITEMS_CREATE",
//                 "description": "Add new items"
//             },
//             {
//                 "id": 2,
//                 "privilegeName": "View Items",
//                 "privilegeKey": "EZH_INV_ITEMS_VIEW",
//                 "description": "View item list"
//             },
//             {
//                 "id": 6,
//                 "privilegeName": "Export Items",
//                 "privilegeKey": "EZH_INV_ITEMS_EXPORT",
//                 "description": "Export item data"
//             },
//             {
//                 "id": 4,
//                 "privilegeName": "Update Item",
//                 "privilegeKey": "EZH_INV_ITEMS_UPDATE",
//                 "description": "Modify item details"
//             },
//             {
//                 "id": 5,
//                 "privilegeName": "Delete Item",
//                 "privilegeKey": "EZH_INV_ITEMS_DELETE",
//                 "description": "Delete items"
//             }
//         ]
//     },
//     {
//         "id": 3,
//         "moduleName": "Stock",
//         "moduleKey": "EZH_INV_STOCK",
//         "description": "Stock adjustments and inventory flow",
//         "isActive": true,
//         "privileges": [
//             {
//                 "id": 7,
//                 "privilegeName": "View Stock",
//                 "privilegeKey": "EZH_INV_STOCK_VIEW",
//                 "description": "View inventory stock"
//             },
//             {
//                 "id": 9,
//                 "privilegeName": "Approve Stock Adjustment",
//                 "privilegeKey": "EZH_INV_STOCK_APPROVE",
//                 "description": "Approve stock changes"
//             },
//             {
//                 "id": 8,
//                 "privilegeName": "Adjust Stock",
//                 "privilegeKey": "EZH_INV_STOCK_ADJUST",
//                 "description": "Perform stock adjustments"
//             }
//         ]
//     },


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
