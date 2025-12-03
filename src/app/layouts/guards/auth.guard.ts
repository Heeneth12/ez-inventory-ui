import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserInitResponse } from '../models/Init-response.model';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> {
    const isLoggedIn = this.authService.isLoggedIn();

    if (!isLoggedIn) {
      return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: route.url.join('/') } });
    }

    const currentUser = this.authService.getCurrentUserValue();

    if (currentUser) {
      return this.checkPermissions(route, currentUser);
    } else {
      // Handle page refresh - fetch data first
      return this.authService.fetchUserInit().pipe(
        map((user) => {
          return this.checkPermissions(route, user);
        }),
        catchError(() => {
          this.authService.logout();
          return of(this.router.createUrlTree(['/login']));
        })
      );
    }
  }

  private checkPermissions(route: ActivatedRouteSnapshot, user: UserInitResponse): boolean | UrlTree {

    // 1. Get the required Module Key from the Route Data (defined in step 1)
    const requiredModuleKey = route.data['moduleKey'] as string;

    // If the route has no specific module requirement, allow access (e.g., home page)
    if (!requiredModuleKey) {
      return true;
    }

    // 2. Check if the user has this module in any of their applications
    const hasModuleAccess = this.hasModuleAccess(user, requiredModuleKey);

    if (hasModuleAccess) {
      return true;
    }

    // 3. Access Denied
    console.warn(`Access denied: User missing module ${requiredModuleKey}`);
    return this.router.createUrlTree(['/forbidden']);
  }

  /**
   * Helper to parse the UserInitResponse structure
   */
  public hasModuleAccess(user: UserInitResponse, moduleKey: string): boolean {
    if (!user.userApplications || user.userApplications.length === 0) {
      return false;
    }

    // Look through all applications assigned to the user
    return user.userApplications.some(app => {
      // Check if modulePrivileges exists and has the specific key
      return app.modulePrivileges && Object.prototype.hasOwnProperty.call(app.modulePrivileges, moduleKey);
    });
  }
}