import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment.development";
import { HttpService } from "../../service/http-svc/http.service";

@Injectable({
    providedIn: 'root'
})
export class SubscriptionsService {

    private static SUBSCRIPTIONS_BASE_URL = environment.authUrl + '/api/v1/subscriptions';

    constructor(private httpService: HttpService) { }

    subscribeTenant(tenantId: number, planId: number, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${SubscriptionsService.SUBSCRIPTIONS_BASE_URL}/tenant/${tenantId}/plan/${planId}`, null, successfn, errorfn);
    }

    getCurrentSubscription(tenantId: number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${SubscriptionsService.SUBSCRIPTIONS_BASE_URL}/tenant/${tenantId}/current`, successfn, errorfn);
    }

    cancelSubscription(subscriptionId: number, successfn: any, errorfn: any) {
        return this.httpService.putHttp(`${SubscriptionsService.SUBSCRIPTIONS_BASE_URL}/${subscriptionId}/cancel`, null, successfn, errorfn);
    }

    createPlan(planDto: any, successfn: any, errorfn: any) {
        return this.httpService.postHttp(`${SubscriptionsService.SUBSCRIPTIONS_BASE_URL}`, planDto, successfn, errorfn);
    }

    getActivePlans(successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${SubscriptionsService.SUBSCRIPTIONS_BASE_URL}/active`, successfn, errorfn);
    }

    getPlanById(id: number, successfn: any, errorfn: any) {
        return this.httpService.getHttp(`${SubscriptionsService.SUBSCRIPTIONS_BASE_URL}/${id}`, successfn, errorfn);
    }
}