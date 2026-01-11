import { Component, OnInit, OnDestroy, NgZone, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../layouts/guards/auth.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment.development';
declare const google: any;

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy, AfterViewInit {
  isLogin = true;
  isLoading = false;
  loadingText = 'Please wait...';
  authForm!: FormGroup;
  private routeSub: Subscription | undefined;
  private googleClientId = environment.googleClientId;

  countries = [
    { code: '+91', label: 'IN (+91)' },
    { code: '+1', label: 'US (+1)' },
    { code: '+44', label: 'UK (+44)' },
    { code: '+971', label: 'UAE (+971)' },
    { code: '+61', label: 'AU (+61)' },
    { code: '+65', label: 'SG (+65)' }
  ];

  constructor(
    private fb: FormBuilder,
    private authSvc: AuthService,
    private route: ActivatedRoute,
    private ngZone: NgZone
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.routeSub = this.route.queryParams.subscribe(params => {
      if (params['demo'] === 'true') {
        this.onDemoLogin();
      }
    });
  }

  ngAfterViewInit() {
    // We try to initialize the button when the view loads
    this.initializeGoogleButton();
  }

  ngOnDestroy() {
    if (this.routeSub) this.routeSub.unsubscribe();
  }

  // Initialize form based on mode
  private initForm() {
    if (this.isLogin) {
      this.authForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]]
      });
    } else {
      // Registration Form
      this.authForm = this.fb.group({
        name: ['', Validators.required],
        companyName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        countryCode: ['+91', Validators.required], 
        phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]], 
        addressLine1: ['', Validators.required],
        addressLine2: [''],
        city: ['', Validators.required],
        state: ['', Validators.required],
        pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
      });
    }
  }

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.initForm(); 

    // If we switched back to Login mode, we must re-render the Google Button
    // We use setTimeout to let Angular render the empty <div> first
    if (this.isLogin) {
        setTimeout(() => {
            this.initializeGoogleButton();
        }, 100);
    }
  }

  onDemoLogin() {
    this.isLoading = true;
    this.loadingText = 'Detected demo link. Spinning up your environment...';
    setTimeout(() => {
      const demoCredentials = { email: 'demo@ezh.com', password: 'Pass1234' };
      this.executeLogin(demoCredentials);
    }, 1500);
  }

  onSubmit() {
    if (this.authForm.valid) {
      this.isLoading = true;
      this.loadingText = this.isLogin ? 'Signing in...' : 'Creating your account...';

      // Distinguish between login and register payload
      if (this.isLogin) {
        this.executeLogin(this.authForm.value);
      } else {
        // Handle Registration Logic here
        console.log("Register Payload:", this.authForm.value);
        // simulate success for now
        setTimeout(() => { this.isLoading = false; }, 2000);
      }
    } else {
      this.authForm.markAllAsTouched();
    }
  }

  initializeGoogleButton() {
    // 1. Check if the Google script is loaded
    if (typeof google === 'undefined') {
        console.error('Google GSI script not loaded');
        return;
    }

    // 2. Check if the container element exists in the DOM
    const btnContainer = document.getElementById("google-btn-container");
    if (!btnContainer) {
        // This is normal if we are in Register mode
        return;
    }

    // 3. Initialize Google Auth
    google.accounts.id.initialize({
      client_id: this.googleClientId,
      callback: (response: any) => this.handleGoogleCredentialResponse(response)
    });

    // 4. Render the button
    google.accounts.id.renderButton(
      btnContainer,
      { 
        theme: "outline", 
        size: "large", 
        width: "100%", // This tells Google to fill the container width
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "left"
      }
    );
  }

  handleGoogleCredentialResponse(response: any) {
    // This callback runs outside Angular's zone, so we need to re-enter it
    this.ngZone.run(() => {
      console.log("Google Token Received:", response.credential);
      
      this.isLoading = true;
      this.loadingText = 'Verifying with Google...';

      this.authSvc.loginWithGoogle(
        response.credential,
        (success) => {
          console.log("Google Login Success");
          // Navigation is handled in AuthService
        },
        (error) => {
          console.error("Google Login Error", error);
          this.isLoading = false;
          this.loadingText = 'Please wait...';
          alert('Google Sign-In Failed: ' + (error?.error?.message || 'Unknown Error'));
        }
      );
    });
  }

  private executeLogin(credentials: any) {
    this.authSvc.login(credentials,
      (response: any) => console.log("Login success"),
      (error: any) => {
        console.error("Login error", error);
        this.isLoading = false;
        this.loadingText = 'Please wait...';
      }
    );
  }
}