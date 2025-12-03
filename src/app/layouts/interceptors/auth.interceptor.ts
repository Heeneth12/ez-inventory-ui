import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError, Observable } from 'rxjs';
import { CommonService } from '../service/common/common.service';
import { AuthService } from '../guards/auth.service';
import { environment } from '../../../environments/environment.development';



@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    // Flag to prevent multiple refresh tokens from triggering simultaneously
    private isRefreshing = false;

    constructor(
        private authService: AuthService,
        private commonService: CommonService,
        private router: Router
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.authService.getAccessToken();

        // 1. Prepare base headers (Always required, e.g. AppKey)
        const headersConfig: any = {
            appKey: environment.appKey
        };

        // 2. Add Authorization token ONLY if it exists
        if (token) {
            headersConfig['Authorization'] = `Bearer ${token}`;
        }

        // 3. Clone the request with the new headers
        const request = req.clone({
            setHeaders: headersConfig
        });

        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                // Check if 401 and we have a refresh token
                // ALSO: Ensure we aren't already trying to refresh (to prevent infinite loops)
                if (error.status === 401 && this.authService.getRefreshToken() && !req.url.includes('refresh')) {
                    return this.handle401Error(request, next);
                }

                // If not 401 or no refresh token, logout and throw error
                if (error.status === 401) {
                    this.authService.logout();
                }

                return throwError(() => error);
            })
        );
    }


    private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (this.isRefreshing) {
            // Simple logic: if already refreshing, just fail (or implement queueing logic if needed)
            return throwError(() => new Error('Refresh already in progress'));
        }

        this.isRefreshing = true;
        const payload = { refreshToken: this.authService.getRefreshToken() };

        return new Observable<HttpEvent<any>>((observer) => {
            this.commonService.refreshToken(
                payload,
                (res: any) => {
                    this.isRefreshing = false;

                    // 1. Save new token
                    localStorage.setItem('access_token', res.data.accessToken);
                    // Optional: Update refresh token if the API returns a new one
                    if (res.data.refreshToken) {
                        localStorage.setItem('refresh_token', res.data.refreshToken);
                    }

                    // 2. Clone the original request with the NEW token
                    const newRequest = request.clone({
                        setHeaders: {
                            Authorization: `Bearer ${res.data.accessToken}`,
                            appKey: environment.appKey
                        }
                    });

                    // 3. Retry the request
                    next.handle(newRequest).subscribe({
                        next: (event) => observer.next(event),
                        error: (err) => observer.error(err),
                        complete: () => observer.complete()
                    });
                },
                (err: any) => {
                    this.isRefreshing = false;
                    // If refresh fails, strict logout
                    this.authService.logout();
                    observer.error(err);
                }
            );
        });
    }
}