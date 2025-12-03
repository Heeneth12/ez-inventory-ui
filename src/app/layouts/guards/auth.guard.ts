import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserInitResponse } from '../models/Init-response.model';

// Mapping configuration: URL path -> Required Module Key
const ROUTE_MODULE_MAPPING = [
  { moduleKey: "FIN_REP", url: "/dashboard" },
  { moduleKey: "FIN_BILL", url: "/bill" }
];

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> {

    const isLoggedIn = this.authService.isLoggedIn();

    // 1. If not logged in -> Redirect immediately
    if (!isLoggedIn) {
      return this.router.createUrlTree(
        ['/login'],
        { queryParams: { returnUrl: route.url.map(u => u.path).join('/') } }
      );
    }

    // 2. If logged in, check if we have User Init Data in memory
    const currentUser = this.authService.getCurrentUserValue();

    if (currentUser) {
      // Data exists, proceed with Role/Privilege checks
      return this.checkPermissions(route, currentUser);
    } else {
      // 3. Token exists (Page Refresh), but memory is empty. Fetch Init Data first.
      return this.authService.fetchUserInit().pipe(
        map((user) => {
          // Data fetched successfully, proceed with Role/Privilege checks
          const permissionCheck = this.checkPermissions(route, user);
          if (permissionCheck === true) return true;
          return permissionCheck; // Returns UrlTree if failed
        }),
        catchError((err) => {
          // Token might be invalid or expired, redirect to login
          this.authService.logout();
          return of(this.router.createUrlTree(['/login']));
        })
      );
    }
  }

  // Helper function to handle role/privilege logic
  private checkPermissions(route: ActivatedRouteSnapshot, user: UserInitResponse): boolean | UrlTree {
    
    // ----------------------------------------------------------------
    // 1. Role Check (Existing Logic)
    // ----------------------------------------------------------------
    const allowedRoles = route.data['roles'] as Array<string>;
    if (allowedRoles?.length) {
      const userRoles = user.userRoles || []; 
      const hasRole = allowedRoles.some(role => userRoles.includes(role));
      if (!hasRole) {
        return this.router.createUrlTree(['/unauthorized']);
      }
    }

    // ----------------------------------------------------------------
    // 2. URL-based Module Access Check (NEW LOGIC)
    // Checks if the current URL requires a specific Module Key
    // ----------------------------------------------------------------
    
    // Get the current path segment (e.g. "reports" or "bill")
    const currentPath = route.url.map(segment => segment.path).join('/');

    // Find if the current path exists in our mapping list
    // We strip the leading '/' from the mapping URL to match the route path format
    const requiredModuleMap = ROUTE_MODULE_MAPPING.find(m => 
      m.url.replace(/^\//, '') === currentPath
    );

    if (requiredModuleMap) {
      const requiredKey = requiredModuleMap.moduleKey;
      let userHasModule = false;

      // Check if user has this module key in any of their applications
      if (user.userApplications) {
        // We look through all apps -> all modulePrivileges
        userHasModule = user.userApplications.some(app => 
          app.modulePrivileges?.some(mod => mod.moduleKey === requiredKey)
        );
      }

      if (!userHasModule) {
        console.warn(`Access denied: User missing module ${requiredKey} for path ${currentPath}`);
        return this.router.createUrlTree(['/unauthorized']);
      }
    }

    // ----------------------------------------------------------------
    // 3. Specific Privilege Check (Existing Logic)
    // Expects route data: { privileges: ['MODULE_KEY:PRIVILEGE_KEY'] }
    // ----------------------------------------------------------------
    const requiredPrivileges = route.data['privileges'] as Array<string>;
    
    if (requiredPrivileges?.length) {
      
      const userPrivileges = new Set<string>();

      if (user.userApplications) {
        user.userApplications.forEach((app: any) => {
          if (app.modulePrivileges) {
            app.modulePrivileges.forEach((mod: any) => {
              const mKey = mod.moduleKey;
              if (mod.privilegeKey && Array.isArray(mod.privilegeKey)) {
                mod.privilegeKey.forEach((pKey: string) => {
                  userPrivileges.add(`${mKey}:${pKey}`);
                });
              }
            });
          }
        });
      }

      const hasAccess = requiredPrivileges.every(req => userPrivileges.has(req));

      if (!hasAccess) {
        return this.router.createUrlTree(['/unauthorized']);
      }
    }

    return true;
  }
}