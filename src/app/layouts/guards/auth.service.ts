import { Injectable } from '@angular/core';
import { CommonService } from '../service/common/common.service';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators'; // Import operators
import { UserInitResponse } from '../models/Init-response.model';
import { BannerLoaderService } from '../components/banner-loader/banner-loader.service';
import { DrawerService } from '../components/drawer/drawerService';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSubject = new BehaviorSubject<UserInitResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private commonService: CommonService, private router: Router, private dannerLoaderSvc: BannerLoaderService, private drawerSvc: DrawerService) { }

  login(payload: any, success: (res: any) => void, error: (err: any) => void) {
    this.dannerLoaderSvc.show();
    this.commonService.signIn(payload,
      (res: any) => {
        localStorage.setItem('access_token', res.data.accessToken);
        localStorage.setItem('refresh_token', res.data.refreshToken);

        this.fetchUserInit().subscribe({
          next: (userInitData) => {
            // Navigate FIRST, then callback
            this.router.navigate(['/dashboard']).then(() => {
              this.dannerLoaderSvc.hide();
              success(res);
            });
          },
          error: (err) => {
            this.dannerLoaderSvc.hide();
            this.logout();
            error(err);
          }
        });
      },
      (err: any) => {
        this.dannerLoaderSvc.hide();
        error(err)
      }
    );
  }

  fetchUserInit(): Observable<UserInitResponse> {
    return new Observable((observer) => {
      this.commonService.initUser(
        (res: any) => {
          const userData: UserInitResponse = res.data;
          this.currentUserSubject.next(userData);
          observer.next(userData);
          observer.complete();
        },
        (err: any) => {
          observer.error(err);
        }
      );
    });
  }

  loginWithGoogle(idToken: string, success: (res: any) => void, error: (err: any) => void) {
    const payload = {
      idToken: idToken,
      appKey: "EZH_INV_001"
    };
    // Use the new method in CommonService
    this.commonService.signInWithGoogle(payload,
      (res: any) => {
        //Save Tokens
        localStorage.setItem('access_token', res.data.accessToken);
        localStorage.setItem('refresh_token', res.data.refreshToken);

        //Fetch User Details & Navigate
        this.fetchUserInit().subscribe({
          next: (userInitData) => {
            this.router.navigate(['/dashboard']).then(() => {
              success(res);
            });
          },
          error: (err) => {
            this.logout();
            error(err);
          }
        });
      },
      (err: any) => error(err)
    );
  }

  logout() {
    localStorage.clear();
    this.drawerSvc.close();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  }

  // Refactored to be cleaner for RxJS pipes
  validateToken(): Observable<boolean> {
    this.dannerLoaderSvc.show();
    return new Observable<boolean>((observer) => {
      this.commonService.validateToken(
        (res: any) => {
          observer.next(true);
          observer.complete();
          this.dannerLoaderSvc.hide();
        },
        (err: any) => {
          this.logout(); // Auto logout on invalid token
          observer.next(false);
          observer.complete();
          this.dannerLoaderSvc.hide();
        }
      );
    });
  }

  isLoggedIn(): Observable<boolean> {
    const token = this.getAccessToken();
    if (!token) {
      return of(false);
    }
    // (Optional optimization, remove if you want strict server validation every route change)
    if (this.currentUserSubject.value) {
      return of(true);
    }

    return this.validateToken();
  }

  getCurrentUserValue(): UserInitResponse | null {
    return this.currentUserSubject.value;
  }
}