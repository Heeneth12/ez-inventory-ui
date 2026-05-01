import { Injectable } from '@angular/core';
import { HttpService } from '../http-svc/http.service';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  private static BASE_URL = environment.authUrl;

  private static AUTH_BASE_URL = CommonService.BASE_URL + '/api/v1/auth';

  private static USER_REQUEST_BASE_URL = CommonService.BASE_URL + '/api/v1/userrequests';

  constructor(private httpService: HttpService) { }

  signIn(request: any, successfn: any, errorfn: any) {
    return this.httpService.postHttp(`${CommonService.AUTH_BASE_URL}/signin`, request, successfn, errorfn);
  }

  initUser(success: any, error: any) {
    return this.httpService.getHttp(`${CommonService.AUTH_BASE_URL}/user/init`, success, error);
  }

  refreshToken(request: any, success: any, error: any) {
    return this.httpService.postHttp(`${CommonService.AUTH_BASE_URL}/refresh`, request, success, error);
  }

  validateToken(success: any, error: any) {
    return this.httpService.getHttp(`${CommonService.AUTH_BASE_URL}/validate`, success, error);
  }

  signInWithGoogle(request: any, successfn: any, errorfn: any) {
    return this.httpService.postHttp(`${CommonService.AUTH_BASE_URL}/google`, request, successfn, errorfn);
  }

  createTenant(filter: any, successfn: any, errorfn: any) {
    return this.httpService.postHttp(`${CommonService.AUTH_BASE_URL}/register`, filter, successfn, errorfn);
  }

  verifyTenant(tenantId: any, otp: any, successfn: any, errorfn: any) {
    return this.httpService.postHttp(`${CommonService.AUTH_BASE_URL}/verifyTenant?tenantId=${tenantId}&otp=${otp}`, null, successfn, errorfn);
  }

  signOut(success: any, error: any) {
    return this.httpService.postHttp(`${CommonService.AUTH_BASE_URL}/signout`, null, success, error);
  }

  forgotPassword(request: any, success: any, error: any) {
    return this.httpService.postHttp(`${CommonService.AUTH_BASE_URL}/forgot-password`, request, success, error);
  }

  resetPassword(request: any, success: any, error: any) {
    return this.httpService.postHttp(`${CommonService.AUTH_BASE_URL}/reset-password`, request, success, error);
  }

  resendOtp(request: any, success: any, error: any) {
    return this.httpService.postHttp(`${CommonService.AUTH_BASE_URL}/resend-otp`, request, success, error);
  }

  createRequest(type: 'app' | 'mkt', request: any, success: any, error: any) {
    const url = type == 'app' ? `${CommonService.USER_REQUEST_BASE_URL}` : `${CommonService.USER_REQUEST_BASE_URL}/mkt`;
    return this.httpService.postHttp(url, request, success, error);
  }

  getRequestById(userReqUuid: any, success: any, error: any) {
    return this.httpService.getHttp(`${CommonService.USER_REQUEST_BASE_URL}/${userReqUuid}`, success, error);
  }

  updateRequest(userReqUuid: any, request: any, success: any, error: any) {
    return this.httpService.putHttp(`${CommonService.USER_REQUEST_BASE_URL}/${userReqUuid}`, request, success, error);
  }

  getRequestsWithPagination(tenantUuid: any, page: any, size: any, sortBy: any, sortDir: any, success: any, error: any) {
    return this.httpService.getHttp(`${CommonService.USER_REQUEST_BASE_URL}?tenantUuid=${tenantUuid}&page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`, success, error);
  }
}