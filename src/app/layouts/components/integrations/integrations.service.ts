import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment.development";
import { HttpService } from "../../service/http-svc/http.service";
import { IntegrationRequest } from "./integrations.model";

@Injectable({
    providedIn: 'root'
})
export class IntegrationsService {

    private static BASE_URL = environment.authUrl;
    private static INTEGRATIONS_BASE_URL = IntegrationsService.BASE_URL + '/api/v1/integrations';

    constructor(private httpService: HttpService) { }

    createIntegration(request: IntegrationRequest, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${IntegrationsService.INTEGRATIONS_BASE_URL}`, request, successfn, errorfn);
    }

    getIntegrations(successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${IntegrationsService.INTEGRATIONS_BASE_URL}`, successfn, errorfn);
    }

    getIntegrationById(integrationId: number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${IntegrationsService.INTEGRATIONS_BASE_URL}/${integrationId}`, successfn, errorfn);
    }

    updateIntegration(integrationId: number, request: IntegrationRequest, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${IntegrationsService.INTEGRATIONS_BASE_URL}/${integrationId}/update`, request, successfn, errorfn);
    }

    // soft delete
    deleteIntegration(integrationId: number, successfn: any, errorfn: any) {
        return this.httpService.deleteHttp(`${IntegrationsService.INTEGRATIONS_BASE_URL}/${integrationId}`, successfn, errorfn);
    }

    toggleIntegration(integrationId: number, successfn: any, errorfn: any) {
        return this.httpService.patchHttp(`${IntegrationsService.INTEGRATIONS_BASE_URL}/${integrationId}/toggle`, {}, successfn, errorfn);
    }

    testConnection(integrationId: number, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${IntegrationsService.INTEGRATIONS_BASE_URL}/${integrationId}/test-connection`, {}, successfn, errorfn);
    }

    getIntegrationByType(type: string, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${IntegrationsService.INTEGRATIONS_BASE_URL}/by-type?type=${type}`, successfn, errorfn);
    }

    checkIntegration(type: string, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${IntegrationsService.INTEGRATIONS_BASE_URL}/check?type=${type}`, successfn, errorfn);
    }
}
