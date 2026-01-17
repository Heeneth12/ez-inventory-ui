import { Injectable } from '@angular/core';
import { HttpService } from '../http-svc/http.service';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  private static BASE_URL = environment.authUrl;

  private static AUTH_BASE_URL = CommonService.BASE_URL + '/api/v1/auth';

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
}