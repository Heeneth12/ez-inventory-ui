import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpService } from "../../layouts/service/http-svc/http.service";

@Injectable({
    providedIn: 'root'
})
export class EmployeeService {

    private static EMPLOYEE_BASE_URL = environment.devUrl + '/v1/employee';

    constructor(private httpService: HttpService) { }

    createEmployee(item: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${EmployeeService.EMPLOYEE_BASE_URL}`, item, successfn, errorfn);
    }

    updateEmployee(employeeId: number, item: any, successfn: any, errorfn: any) {
        return this.httpService.putHttp(`${EmployeeService.EMPLOYEE_BASE_URL}/${employeeId}/update`, item, successfn, errorfn);
    }

    getEmployeeById(id: number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${EmployeeService.EMPLOYEE_BASE_URL}/${id}`, successfn, errorfn);
    }

    getAllEmployees(page: number, size: number, filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${EmployeeService.EMPLOYEE_BASE_URL}/all?page=${page}&size=${size}`, filter, successfn, errorfn);
    }

    toggleEmployeeStatus(id: number, active: boolean, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${EmployeeService.EMPLOYEE_BASE_URL}/${id}/status?active=${active}`, null, successfn, errorfn);
    }
}