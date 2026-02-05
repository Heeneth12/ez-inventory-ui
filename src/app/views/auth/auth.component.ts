import { Component, OnInit, OnDestroy, NgZone, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../layouts/guards/auth.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { CommonService } from '../../layouts/service/common/common.service';
import { ToastService } from '../../layouts/components/toast/toastService';

declare const google: any;
type AuthMode = 'login' | 'register' | 'booking' | 'forgot-password';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy, AfterViewInit {
  currentMode: AuthMode = 'login';
  isLoading = false;
  loadingText = 'Please wait...';
  authForm!: FormGroup;
  private routeSub: Subscription | undefined;
  private googleClientId = environment.googleClientId;
  private readonly APP_KEY = 'EZH_INV_APP';

  countries = [
    { code: '+91', label: 'IN (+91)', countryName: 'India' },
    { code: '+1', label: 'US (+1)', countryName: 'USA' },
    { code: '+44', label: 'UK (+44)', countryName: 'UK' },
    { code: '+971', label: 'UAE (+971)', countryName: 'UAE' },
    { code: '+61', label: 'AU (+61)', countryName: 'Australia' },
    { code: '+65', label: 'SG (+65)', countryName: 'Singapore' }
  ];

  bookingReasons = [
    'Request a Demo',
    'Pricing Inquiry',
    'Custom Requirements',
    'Partnership',
    'Other'
  ];

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private toastService: ToastService,
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
      if (params['booking'] === 'true') {
        this.switchMode('booking');
      }
    });
  }

  ngAfterViewInit() {
    if (this.currentMode === 'login') {
      this.initializeGoogleButton();
    }
  }

  ngOnDestroy() {
    if (this.routeSub) this.routeSub.unsubscribe();
  }

  // --- Getters for Cleaner Template ---
  get isLoginMode(): boolean { return this.currentMode === 'login'; }
  get isRegisterMode(): boolean { return this.currentMode === 'register'; }
  get isBookingMode(): boolean { return this.currentMode === 'booking'; }
  get isForgotPassMode(): boolean { return this.currentMode === 'forgot-password'; }

  get headerTitle(): string {
    if (this.isLoginMode) return 'Welcome back';
    if (this.isBookingMode) return 'Book Consultation';
    if (this.isForgotPassMode) return 'Reset Password'; // New Title
    return 'Start your 14-day free trial';
  }

  get headerSubtitle(): string {
    if (this.isLoginMode) return 'Please enter your details to sign in.';
    if (this.isBookingMode) return 'Tell us your requirements.';
    if (this.isForgotPassMode) return 'Enter your email to receive reset instructions.'; // New Subtitle
    return 'No credit card required. Setup your warehouse in minutes.';
  }

  // --- Logic ---

  private initForm() {
    if (this.isForgotPassMode) {
      this.authForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]]
      });
    } else if (this.isBookingMode) {
      this.authForm = this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        countryCode: ['+91', Validators.required],
        phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        reason: ['Request a Demo', Validators.required],
        message: ['', [Validators.required, Validators.minLength(10)]]
      });
    } else if (this.isLoginMode) {
      this.authForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]]
      });
    } else {
      // Register
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
        country: ['India', Validators.required],
        pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
      });
    }
  }

  switchMode(mode: AuthMode) {
    this.currentMode = mode;
    this.initForm();
    // Re-init Google Button if returning to login
    if (mode === 'login') {
      setTimeout(() => this.initializeGoogleButton(), 100);
    }
  }

  toggleMode() {
    // Toggles only between Login and Register
    this.switchMode(this.isLoginMode ? 'register' : 'login');
  }

  onDemoLogin() {
    this.switchMode('login'); // Ensure we are in login mode
    this.isLoading = true;
    this.loadingText = 'Detected demo link. Spinning up your environment...';
    setTimeout(() => {
      const demoCredentials = { email: 'demo@ezh.com', password: 'Pass1234' };
      this.executeLogin(demoCredentials);
    }, 1500);
  }

  onSubmit() {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    if (this.isLoginMode) {
      this.loadingText = 'Signing in...';
      this.executeLogin(this.authForm.value);
    } else if (this.isRegisterMode) {
      this.loadingText = 'Creating your account...';
      this.executeRegistration();
    } else if (this.isBookingMode) {
      this.loadingText = 'Sending request...';
      this.executeBooking();
    } else if (this.isForgotPassMode) {
      this.loadingText = 'Sending reset link...';
      this.executeForgotPassword();
    }
  }

  private executeBooking() {
    // TODO: Implement Booking Service Call
    console.log('Booking Payload:', this.authForm.value);
    setTimeout(() => {
      this.isLoading = false;
      this.toastService.show('Request sent successfully!', 'success');
      this.switchMode('login');
    }, 1500);
  }

  private executeRegistration() {
    const formValue = this.authForm.value;
    const registerPayload = {
      tenantName: formValue.companyName,
      adminFullName: formValue.name,
      adminEmail: formValue.email,
      password: formValue.password,
      adminPhone: `${formValue.countryCode} ${formValue.phone}`,
      isPersonal: false,
      appKey: this.APP_KEY,
      address: {
        addressLine1: formValue.addressLine1,
        addressLine2: formValue.addressLine2,
        city: formValue.city,
        state: formValue.state,
        country: formValue.country,
        pinCode: formValue.pincode,
        type: 'OFFICE'
      }
    };

    this.commonService.createTenant(registerPayload,
      (response: any) => {
        this.isLoading = false;
        this.toastService.show('Registration Successful!', "success");
        this.switchMode('login');
      },
      (err: any) => {
        this.isLoading = false;
        this.toastService.show(`Registration Failed  ${err?.error?.message}`, 'error');
      }
    );
  }

  initializeGoogleButton() {
    if (typeof google === 'undefined') return;

    const btnContainer = document.getElementById("google-btn-container");
    if (!btnContainer) return;

    google.accounts.id.initialize({
      client_id: this.googleClientId,
      callback: (response: any) => this.handleGoogleCredentialResponse(response)
    });
    google.accounts.id.renderButton(
      btnContainer,
      { theme: "outline", size: "large", width: "100%", text: "continue_with", shape: "rectangular", logo_alignment: "left" }
    );
  }

  updateCountryName() {
    const selectedCode = this.authForm.get('countryCode')?.value;
    const countryObj = this.countries.find(c => c.code === selectedCode);
    if (countryObj) {
      this.authForm.patchValue({ country: countryObj.countryName });
    }
  }

  handleGoogleCredentialResponse(response: any) {
    this.ngZone.run(() => {
      this.isLoading = true;
      this.loadingText = 'Verifying with Google...';
      this.authSvc.loginWithGoogle(
        response.credential,
        () => { },
        () => {
          this.isLoading = false;
          this.toastService.show("Google Sign-In Failed", 'error');
        }
      );
    });
  }

  private executeForgotPassword() {
    const email = this.authForm.get('email')?.value;
    console.log('Sending reset email to:', email);

    // Simulate API Call
    // this.authSvc.forgotPassword(email)...
    setTimeout(() => {
      this.isLoading = false;
      this.toastService.show('Reset link sent to your email!', 'success');
      this.switchMode('login');
    }, 1500);
  }

  private executeLogin(credentials: any) {
    this.authSvc.login(credentials,
      () => console.log("Login success"),
      (error: any) => {
        this.toastService.show(error.error.message, 'error');
        this.isLoading = false;
      }
    );
  }
}