import { Injectable } from '@angular/core';
import { CommonService } from '../service/common/common.service';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators'; // Import operators
import { UserInitResponse } from '../models/Init-response.model';
import { BannerLoaderService } from '../components/banner-loader/banner-loader.service';
import { DrawerService } from '../components/drawer/drawerService';
import { NgxPermissionsService } from 'ngx-permissions';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSubject = new BehaviorSubject<UserInitResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private commonService: CommonService, private router: Router, private dannerLoaderSvc: BannerLoaderService, private drawerSvc: DrawerService, private permissionsService: NgxPermissionsService) { }

  login(payload: any, success: (res: any) => void, error: (err: any) => void) {
    this.dannerLoaderSvc.show();
    this.commonService.signIn(payload,
      (res: any) => {
        localStorage.setItem('access_token', res.data.accessToken);
        localStorage.setItem('refresh_token', res.data.refreshToken);

        this.fetchUserInit().subscribe({
          next: (userInitData) => {
            // Navigate to root - RedirectGuard will handle user type-based routing
            this.router.navigate(['/']).then(() => {
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
          sessionStorage.setItem('tenantId', userData.tenantId.toString());
          sessionStorage.setItem('userId', userData.id.toString());
          sessionStorage.setItem('currentUserUuid', userData.userUuid);
          this.loadPermissionsIntoStore(userData);
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
            // Navigate to root - RedirectGuard will handle user type-based routing
            this.router.navigate(['/']).then(() => {
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

  public loadPermissionsIntoStore(user: UserInitResponse) {
    const allPermissions: string[] = [];
    user.userApplications.forEach(app => {
      if (app.modulePrivileges) {
        // Extract all arrays from the modulePrivileges object and flatten them
        Object.values(app.modulePrivileges).forEach((perms: any) => {
          if (Array.isArray(perms)) {
            allPermissions.push(...perms);
          }
        });
      }
    });
    // This tells ngx-permissions what the user can do
    this.permissionsService.loadPermissions(allPermissions);
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    // This handles the nesting logic once and for all
    return user.userApplications.some(app =>
      Object.values(app.modulePrivileges || {}).some((perms: any) =>
        perms.includes(permission)
      )
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