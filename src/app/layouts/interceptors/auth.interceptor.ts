import { Injectable, Injector } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, filter, take, switchMap, catchError } from 'rxjs';
import { CommonService } from '../service/common/common.service';
import { AuthService } from '../guards/auth.service';
import { environment } from '../../../environments/environment.development';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(
    private injector: Injector,
    private commonService: CommonService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Lazy load AuthService to prevent Circular Dependency Loop
    const authService = this.injector.get(AuthService);
    const token = authService.getAccessToken();

    const authReq = this.addToken(req, token);

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Note: We exclude the login/refresh URL specifically to avoid infinite loops
        if ((error.status === 401 || error.status === 403) && 
            !authReq.url.includes('auth/refresh') && 
            !authReq.url.includes('auth/login')) {
          return this.handleAuthError(authReq, next);
        }

        // If the refresh token itself fails (401/403), logout immediately
        if ((error.status === 401 || error.status === 403) && authReq.url.includes('auth/refresh')) {
             authService.logout();
        }

        return throwError(() => error);
      })
    );
  }

  // Helper to cleanly add headers
  private addToken(request: HttpRequest<any>, token: string | null) {
    const headersConfig: any = {
      appKey: environment.appKey
    };
    if (token) {
      headersConfig['Authorization'] = `Bearer ${token}`;
    }
    return request.clone({ setHeaders: headersConfig });
  }

  // Renamed for clarity since it handles 401 and 403
  private handleAuthError(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const authService = this.injector.get(AuthService);

      return new Observable<string>((observer) => {
          this.commonService.refreshToken({ refreshToken: authService.getRefreshToken() },
            (res: any) => {
               // Success: Save new tokens
               const newToken = res.data.accessToken;
               localStorage.setItem('access_token', newToken);
               if (res.data.refreshToken) {
                   localStorage.setItem('refresh_token', res.data.refreshToken);
               }
               observer.next(newToken);
               observer.complete();
            },
            (err: any) => {
               // Error: Refresh failed
               observer.error(err);
            }
          );
      }).pipe(
        switchMap((newToken: string) => {
          this.isRefreshing = false;
          // Notify all waiting requests that the new token is ready!
          this.refreshTokenSubject.next(newToken);
          return next.handle(this.addToken(request, newToken));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          authService.logout();
          return throwError(() => err);
        })
      );

    } else {
      // Wait until the refreshTokenSubject is not null
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          return next.handle(this.addToken(request, token));
        })
      );
    }
  }
}