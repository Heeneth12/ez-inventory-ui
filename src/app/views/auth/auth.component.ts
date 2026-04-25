import { Component, OnInit, OnDestroy, NgZone, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../layouts/guards/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { ToastService } from '../../layouts/components/toast/toastService';
import { ForgotPasswordModel, ResendOtpModel, ResetPasswordModel } from './auth.model';


declare const google: any;
type AuthMode = 'login' | 'register' | 'booking' | 'forgot-password' | 'otp-verification';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy, AfterViewInit {
  currentMode: AuthMode = 'login';
  isLoading = false;
  isResendingOtp = false;
  loadingText = 'Please wait...';
  authForm!: FormGroup;
  private routeSub: Subscription | undefined;
  private googleClientId = environment.googleClientId;
  private readonly APP_KEY = 'EZH_INV_APP';
  private forgotTenantId: number = 0;
  forgotEmail: string = '';

  countries = [
    { code: '+91', label: 'IN (+91)', countryName: 'India' },
    { code: '+1', label: 'US (+1)', countryName: 'USA' },
    { code: '+44', label: 'UK (+44)', countryName: 'UK' },
    { code: '+971', label: 'UAE (+971)', countryName: 'UAE' },
    { code: '+61', label: 'AU (+61)', countryName: 'Australia' },
    { code: '+65', label: 'SG (+65)', countryName: 'Singapore' },
  ];

  bookingReasons = [
    'Request a Demo',
    'Pricing Inquiry',
    'Custom Requirements',
    'Partnership',
    'Other',
  ];

  constructor(
    private fb: FormBuilder,
    private toastService: ToastService,
    private authSvc: AuthService,
    private route: ActivatedRoute,
    private ngZone: NgZone,
    private router: Router
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.routeSub = this.route.queryParams.subscribe(params => {
      if (params['demo'] === 'true') this.onDemoLogin();
      if (params['booking'] === 'true') this.switchMode('booking');
    });
  }

  ngAfterViewInit() {
    if (this.currentMode === 'login') this.initializeGoogleButton();
  }

  ngOnDestroy() {
    if (this.routeSub) this.routeSub.unsubscribe();
  }

  // Getters 

  get isLoginMode() { return this.currentMode === 'login'; }
  get isBookingMode() { return this.currentMode === 'booking'; }
  get isForgotPassMode() { return this.currentMode === 'forgot-password'; }
  get isOtpVerificationMode() { return this.currentMode === 'otp-verification'; }

  get headerTitle(): string {
    if (this.isLoginMode) return 'Welcome back';
    if (this.isBookingMode) return 'Book Consultation';
    if (this.isForgotPassMode) return 'Reset Password';
    if (this.isOtpVerificationMode) return 'Verify & Reset';
    return 'Welcome back';
  }

  get headerSubtitle(): string {
    if (this.isLoginMode) return 'Please enter your details to sign in.';
    if (this.isBookingMode) return 'Tell us your requirements.';
    if (this.isForgotPassMode) return 'Enter your email to receive reset instructions.';
    if (this.isOtpVerificationMode) return `Enter the OTP sent to ${this.forgotEmail}`;
    return 'Please enter your details to sign in.';
  }

  // Form init 

  private initForm() {
    if (this.isForgotPassMode) {
      this.authForm = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
    } else if (this.isOtpVerificationMode) {
      this.authForm = this.fb.group({
        otp: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
      });
    } else if (this.isBookingMode) {
      this.authForm = this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        countryCode: ['+91', Validators.required],
        phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        reason: ['Request a Demo', Validators.required],
        message: ['', [Validators.required, Validators.minLength(10)]],
      });
    } else {
      // login (default)
      this.authForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
      });
    }
  }

  switchMode(mode: AuthMode) {
    this.currentMode = mode;
    this.initForm();
    if (mode === 'login') setTimeout(() => this.initializeGoogleButton(), 100);
  }

  toggleMode() {
    // Login → Register opens the onboarding overlay
    //this.switchMode(this.isLoginMode ? 'register' : 'login');
    // go to auth/register
    this.router.navigate(['/auth/register']);
  }

  // Onboarding handlers 

  /**
   * Called when the user exits the onboarding flow (Back to login).
   */
  exitOnboardingHandler() {
    this.switchMode('login');
  }

  /**
   * Called when onboarding is fully completed.
   * Here you can call your backend registration API with the full result.
   */
  onOnboardingComplete(result: any) {
    console.log('Onboarding complete:', result);

    // TODO: Map result to your existing createTenant payload
    const registerPayload = {
      tenantName: result.company.companyName,
      adminFullName: result.personal.fullName,
      adminEmail: result.company.email,
      password: '',                // Handled in onboarding if needed
      adminPhone: `${result.company.countryCode} ${result.company.phone}`,
      businessType: result.company.businessType,
      isPersonal: false,
      appKey: this.APP_KEY,
      address: {
        addressLine1: result.address.addressLine1,
        addressLine2: result.address.addressLine2,
        city: result.address.city,
        state: result.address.state,
        country: result.address.country,
        pinCode: result.address.pincode,
        type: 'OFFICE',
      },
    };

    // Uncomment and use your service:
    // this.commonService.createTenant(registerPayload,
    //   () => { this.toastService.show('Registration Successful!', 'success'); this.switchMode('login'); },
    //   (err: any) => { this.toastService.show(`Registration Failed: ${err?.error?.message}`, 'error'); }
    // );

    this.toastService.show('Registration Successful! Redirecting...', 'success');
    this.switchMode('login');
  }

  // Auth actions 

  onDemoLogin() {
    this.switchMode('login');
    this.isLoading = true;
    this.loadingText = 'Spinning up demo environment...';
    setTimeout(() => {
      this.executeLogin({ email: 'demo@ezh.com', password: 'Pass1234' });
    }, 1500);
  }

  onSubmit() {
    if (this.authForm.invalid) { this.authForm.markAllAsTouched(); return; }
    this.isLoading = true;
    if (this.isLoginMode) {
      this.loadingText = 'Signing in...';
      this.executeLogin(this.authForm.value);
    } else if (this.isBookingMode) {
      this.loadingText = 'Sending request...';
      this.executeBooking();
    } else if (this.isForgotPassMode) {
      this.loadingText = 'Sending OTP...';
      this.executeForgotPassword();
    } else if (this.isOtpVerificationMode) {
      this.loadingText = 'Resetting password...';
      this.executeResetPassword();
    }
  }

  private executeBooking() {
    console.log('Booking payload:', this.authForm.value);
    setTimeout(() => {
      this.isLoading = false;
      this.toastService.show('Request sent successfully!', 'success');
      this.switchMode('login');
    }, 1500);
  }

  private executeForgotPassword() {
    const payload: ForgotPasswordModel = { email: this.authForm.get('email')!.value };
    this.authSvc.forgotPassword(payload,
      (res: any) => {
        this.isLoading = false;
        this.forgotEmail = payload.email;
        this.forgotTenantId = res?.data?.tenantId ?? res?.tenantId ?? 0;
        this.toastService.show('OTP sent to your email!', 'success');
        this.switchMode('otp-verification');
      },
      (err: any) => {
        this.isLoading = false;
        this.toastService.show(err?.error?.message ?? 'Failed to send OTP. Please try again.', 'error');
      }
    );
  }

  executeResendOtp() {
    if (!this.forgotTenantId) {
      this.toastService.show('Session expired. Please restart the password reset.', 'error');
      this.switchMode('forgot-password');
      return;
    }
    this.isResendingOtp = true;
    const payload: ResendOtpModel = { tenantId: this.forgotTenantId };
    this.authSvc.resendOtp(payload,
      (res: any) => {
        this.isResendingOtp = false;
        this.toastService.show('OTP resent successfully!', 'success');
      },
      (err: any) => {
        this.isResendingOtp = false;
        this.toastService.show(err?.error?.message ?? 'Failed to resend OTP.', 'error');
      }
    );
  }

  private executeResetPassword() {
    const payload: ResetPasswordModel = {
      email: this.forgotEmail,
      otp: this.authForm.get('otp')!.value,
      newPassword: this.authForm.get('newPassword')!.value,
    };
    this.authSvc.resetPassword(payload,
      (res: any) => {
        this.isLoading = false;
        this.toastService.show('Password reset successfully! Please sign in.', 'success');
        this.forgotTenantId = 0;
        this.forgotEmail = '';
        this.switchMode('login');
      },
      (err: any) => {
        this.isLoading = false;
        this.toastService.show(err?.error?.message ?? 'Invalid or expired OTP.', 'error');
      }
    );
  }

  private executeLogin(credentials: any) {
    this.authSvc.login(credentials,
      () => { this.isLoading = false; this.toastService.show('Login Successful!', 'success'); },
      (error: any) => { console.error(error); this.isLoading = false; }
    );
  }

  // Google Sign-In 

  initializeGoogleButton() {
    if (typeof google === 'undefined') return;
    const btn = document.getElementById('google-btn-container');
    if (!btn) return;
    google.accounts.id.initialize({
      client_id: this.googleClientId,
      callback: (response: any) => this.handleGoogleCredentialResponse(response),
    });
    google.accounts.id.renderButton(btn, {
      theme: 'outline', size: 'large', width: '100%',
      text: 'continue_with', shape: 'rectangular', logo_alignment: 'left',
    });
  }

  handleGoogleCredentialResponse(response: any) {
    this.ngZone.run(() => {
      this.isLoading = true;
      this.loadingText = 'Verifying with Google...';
      this.authSvc.loginWithGoogle(
        response.credential,
        () => { },
        () => { this.isLoading = false; this.toastService.show('Google Sign-In Failed', 'error'); }
      );
    });
  }
}