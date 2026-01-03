import { Injectable, Injector } from '@angular/core'; // Import Injector
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, filter, take, switchMap, catchError, finalize } from 'rxjs';
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
        if (error.status === 401 && !authReq.url.includes('auth/refresh')) {
          return this.handle401Error(authReq, next);
        }

        // If it's a 401 on the refresh endpoint itself, or any other error, logout.
        if (error.status === 401 && authReq.url.includes('auth/refresh')) {
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

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      // --- Scenario A: First request to hit 401 ---
      this.isRefreshing = true;
      
      // Reset the subject to null so others wait
      this.refreshTokenSubject.next(null);

      const authService = this.injector.get(AuthService);

      // We wrap your callback-based service in an Observable to make it play nice with RxJS
      return new Observable<string>((observer) => {
          this.commonService.refreshToken({ refreshToken: authService.getRefreshToken() },
            (res: any) => {
               // Success Callback
               const newToken = res.data.accessToken;
               localStorage.setItem('access_token', newToken);
               if (res.data.refreshToken) {
                   localStorage.setItem('refresh_token', res.data.refreshToken);
               }
               observer.next(newToken);
               observer.complete();
            },
            (err: any) => {
               // Error Callback
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
      // --- Scenario B: Subsequent requests while refreshing ---
      // Wait until the refreshTokenSubject is not null
      return this.refreshTokenSubject.pipe(
        filter(token => token != null), // Wait for valid token
        take(1), // Take only the first one
        switchMap(token => {
          // Retry the request with the new token
          return next.handle(this.addToken(request, token));
        })
      );
    }
  }
}