import { Injectable } from '@angular/core';
import { CommonService } from '../service/common/common.service';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { UserInitResponse } from '../models/Init-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Subject to hold the current user state
  private currentUserSubject = new BehaviorSubject<UserInitResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private commonService: CommonService, private router: Router) { }

  /**
   * 1. Signs in
   * 2. Saves Tokens
   * 3. Calls User Init
   * 4. Navigates
   */
  login(payload: any, success: any, error: any) {
    this.commonService.signIn(payload,
      (res: any) => {
        // 1. Save Tokens
        localStorage.setItem('access_token', res.data.accessToken);
        localStorage.setItem('refresh_token', res.data.refreshToken);

        // 2. Call User Init immediately after token storage
        this.fetchUserInit().subscribe({
          next: (userInitData) => {
            // 3. Navigate only after user init is ready
            this.router.navigate(['/dashboard']);
            success(res); // Execute original success callback
          },
          error: (err) => {
            // If init fails, we might want to logout/clear tokens
            this.logout();
            error(err);
          }
        });
      },
      (err: any) => error(err)
    );
  }

  /**
   * Fetches user init data and updates the Subject.
   * Wrapped in an Observable so AuthGuard can wait for it.
   */
  fetchUserInit(): Observable<UserInitResponse> {
    return new Observable((observer) => {
      this.commonService.initUser(
        (res: any) => {
          const userData: UserInitResponse = res.data;
          this.currentUserSubject.next(userData);
          // Optional: Store basic user info in local storage if needed for persistence across hard refreshes
          // localStorage.setItem('user_data', JSON.stringify(userData)); 
          
          observer.next(userData);
          observer.complete();
        },
        (err: any) => {
          observer.error(err);
        }
      );
    });
  }

  logout() {
    localStorage.clear();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  }

  isLoggedIn() {
    return !!this.getAccessToken();
  }

  // Helper to get current value synchronously
  getCurrentUserValue(): UserInitResponse | null {
    return this.currentUserSubject.value;
  }
}