import { Injectable } from "@angular/core";
import { HttpService } from "../../layouts/service/http-svc/http.service";
import { environment } from "../../../environments/environment.development";


@Injectable({
    providedIn: 'root'
})
export class ApprovalConsoleService {

    private static APPROVAL_BASE_URL = environment.devUrl + '/v1/approval';

    constructor(private httpService: HttpService) { }


    getAllApprovals(page: number, size: number, filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${ApprovalConsoleService.APPROVAL_BASE_URL}/all?page${page}&size=${size}`, filter, successfn, errorfn);
    }

    getApprovalById(approvalRequestId: number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${ApprovalConsoleService.APPROVAL_BASE_URL}/requests/${approvalRequestId}`, successfn, errorfn);
    }


    saveApprovalConfig(payload: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${ApprovalConsoleService.APPROVAL_BASE_URL}/config`, payload, successfn, errorfn);
    }

    getApprovalConfigById(approvalConfigId: number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${ApprovalConsoleService.APPROVAL_BASE_URL}/config/${approvalConfigId}`, successfn, errorfn);
    }

    getAllConfigs(page: number, size: number, filter: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${ApprovalConsoleService.APPROVAL_BASE_URL}/config/all?page${page}&size=${size}`, filter, successfn, errorfn);
    }

}
