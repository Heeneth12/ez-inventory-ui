import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class RedirectGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(): Observable<boolean | UrlTree> {
    // Check if user is logged in
    return this.authService.isLoggedIn().pipe(
      switchMap((isValid) => {
        if (!isValid) {
          // Not logged in -> redirect to login
          return of(this.router.createUrlTree(['/login']));
        }

        // Get current user data
        const currentUser = this.authService.getCurrentUserValue();

        if (currentUser) {
          // User data exists -> redirect based on user type
          return of(this.redirectBasedOnUserType(currentUser.userType));
        } else {
          // Fetch user data first
          return this.authService.fetchUserInit().pipe(
            map((user) => {
              return this.redirectBasedOnUserType(user.userType);
            }),
            catchError(() => {
              // If fetch fails, logout and redirect to login
              this.authService.logout();
              return of(this.router.createUrlTree(['/login']));
            })
          );
        }
      })
    );
  }

  private redirectBasedOnUserType(userType: string): UrlTree {
    if (userType === 'VENDOR') {
      return this.router.createUrlTree(['/vendor/dashboard']);
    } else {
      return this.router.createUrlTree(['/dashboard']);
    }
  }
}
