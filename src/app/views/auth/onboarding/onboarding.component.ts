import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';

import { Router } from '@angular/router';
import { AuthService } from '../../../layouts/guards/auth.service';
import { CommonService } from '../../../layouts/service/common/common.service';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { SubscriptionsService } from '../../../layouts/components/subscriptions/subscriptions.service';
import { SubscriptionPlanModel } from '../../../layouts/components/subscriptions/subscriptions.model';

export interface OnboardingResult {
  tenantId?: number;
  company: any;
  personal: any;
  address: any;
  tenantDetails: any;
}

const APP_KEY = 'EZH_INV_APP';

// Steps
// 0 → Account setup   (createTenant API)
// 1 → Verify email    (verifyTenant API)
// 2 → Choose plan     (subscribeTenant API — free activates directly, paid shows inline payment)

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingComponent implements OnInit, OnDestroy {
  @Output() onboardingComplete = new EventEmitter<OnboardingResult>();
  @Output() exitOnboardingEvent = new EventEmitter<void>();

  currentStep = 0;
  isLoading = false;
  loadingText = '';

  registeredTenantId: number | null = null;

  // OTP
  otpControls: FormControl[] = Array.from({ length: 6 }, () => new FormControl(''));
  otpExpiry = '04:59';
  resendCooldown = 0;
  private otpTimer: any;
  private resendTimer: any;
  private expirySeconds = 299;

  steps = [
    { label: 'Account setup', icon: 'building', desc: 'Company & admin basics' },
    { label: 'Verify email', icon: 'mail', desc: 'Enter OTP' },
    { label: 'Choose plan', icon: 'tag', desc: 'Pick your subscription' },
  ];

  countries = [
    { code: '+91', label: 'IN +91' },
    { code: '+1', label: 'US +1' },
    { code: '+44', label: 'UK +44' },
    { code: '+971', label: 'UAE +971' },
    { code: '+61', label: 'AU +61' },
    { code: '+65', label: 'SG +65' },
  ];

  businessTypes = [
    { value: 'RETAIL', label: 'Retail' },
    { value: 'WHOLESALE', label: 'Wholesale' },
    { value: 'DISTRIBUTION', label: 'Distribution' },
    { value: 'MANUFACTURING', label: 'Manufacturing' },
    { value: 'ECOMMERCE', label: 'E-commerce' },
    { value: 'SERVICE_PROVIDER', label: 'Service Provider' },
  ];

  indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
    'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal',
  ];

  // Plan & Payment
  activePlans: SubscriptionPlanModel[] = [];
  plansLoading = false;
  selectedPlan: SubscriptionPlanModel | null = null;
  billingCycle: 'monthly' | 'annual' = 'monthly';
  paymentForm!: FormGroup;

  accountForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private router: Router,
    private subscriptionsService: SubscriptionsService,
  ) { }

  ngOnInit() {
    this.initForms();
  }

  ngOnDestroy() {
    clearInterval(this.otpTimer);
    clearInterval(this.resendTimer);
  }

  private initForms() {
    this.accountForm = this.fb.group({
      companyName: ['', Validators.required],
      businessType: ['RETAIL', Validators.required],
      adminFullName: ['', Validators.required],
      adminEmail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      countryCode: ['+91'],
      adminPhone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      country: ['India'],
    }, { validators: this.passwordMatchValidator });

    this.paymentForm = this.fb.group({
      cardholderName: ['', Validators.required],
      cardNumber: ['', [Validators.required, Validators.pattern('^[0-9 ]{16,19}$')]],
      expiry: ['', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])\\/[0-9]{2}$')]],
      cvv: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]],
    });
  }

  private passwordMatchValidator(g: FormGroup) {
    const pass = g.get('password')?.value;
    const confirm = g.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  // ── Computed ──────────────────────────────────────────────────────

  get progressPercent(): number {
    return (this.currentStep / this.steps.length) * 100;
  }

  get filteredPlans(): SubscriptionPlanModel[] {
    return this.activePlans.filter(p =>
      this.billingCycle === 'monthly' ? p.durationDays <= 31 : p.durationDays >= 365
    );
  }

  get passwordsMatch(): boolean {
    return this.accountForm.get('password')?.value === this.accountForm.get('confirmPassword')?.value;
  }

  // ── Navigation ────────────────────────────────────────────────────

  goNext() {
    switch (this.currentStep) {
      case 0: this.handleStep0(); break;
      case 1: this.handleStep1(); break;
      case 2: this.handleStep2(); break;
    }
  }

  goBack() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.cdr.markForCheck();
    }
  }

  private advance() {
    this.currentStep++;
    if (this.currentStep === 2) {
      this.loadActivePlans();
    }
    this.cdr.markForCheck();
  }

  exitOnboarding() {
    this.exitOnboardingEvent.emit();
  }

  // ── Step 0: Create Tenant ─────────────────────────────────────────

  private handleStep0() {
    this.accountForm.markAllAsTouched();
    if (this.accountForm.invalid) return;

    const v = this.accountForm.value;
    const payload = {
      tenantName: v.companyName,
      adminFullName: v.adminFullName,
      adminEmail: v.adminEmail,
      password: v.password,
      adminPhone: `${v.countryCode} ${v.adminPhone}`,
      businessType: v.businessType,
      isPersonal: false,
      appKey: APP_KEY,
      address: {
        addressLine1: v.addressLine1,
        addressLine2: v.addressLine2,
        city: v.city,
        state: v.state,
        country: v.country,
        pinCode: v.pincode,
        type: 'OFFICE',
      },
    };

    this.isLoading = true;
    this.loadingText = 'Creating your account...';

    this.commonService.createTenant(
      payload,
      (res: any) => {
        this.registeredTenantId = res?.data?.tenantId || res?.tenantId || null;
        this.isLoading = false;
        this.sendOtp();
      },
      (err: any) => {
        this.isLoading = false;
        this.toastService.show(err?.error?.message || 'Registration failed. Please try again.', 'error');
        this.cdr.markForCheck();
      },
    );
  }

  // ── Step 1: OTP ───────────────────────────────────────────────────

  private sendOtp() {
    this.advance();
    this.startOtpTimer();
    this.startResendCooldown();
  }

  private handleStep1() {
    const otp = this.otpControls.map(c => c.value).join('');
    if (otp.length < 6) {
      this.toastService.show('Please enter the complete 6-digit OTP.', 'error');
      return;
    }
    this.isLoading = true;
    this.loadingText = 'Verifying OTP...';

    this.commonService.verifyTenant(
      this.registeredTenantId,
      otp,
      (res: any) => {
        const accessToken = res?.data?.accessToken;
        const refreshToken = res?.data?.refreshToken;
        if (accessToken) localStorage.setItem('access_token', accessToken);
        if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
        this.isLoading = false;
        clearInterval(this.otpTimer);
        this.advance();
      },
      (err: any) => {
        this.isLoading = false;
        this.toastService.show(err?.error?.message || 'Invalid OTP. Please try again.', 'error');
        this.cdr.markForCheck();
      },
    );
  }

  resendOtp() {
    if (this.resendCooldown > 0) return;
    this.expirySeconds = 299;
    this.startOtpTimer();
    this.startResendCooldown();
    this.toastService.show('OTP resent to your email!', 'success');
  }

  private startOtpTimer() {
    this.expirySeconds = 299;
    clearInterval(this.otpTimer);
    this.otpTimer = setInterval(() => {
      this.expirySeconds--;
      const m = Math.floor(this.expirySeconds / 60).toString().padStart(2, '0');
      const s = (this.expirySeconds % 60).toString().padStart(2, '0');
      this.otpExpiry = `${m}:${s}`;
      if (this.expirySeconds <= 0) clearInterval(this.otpTimer);
      this.cdr.markForCheck();
    }, 1000);
  }

  private startResendCooldown() {
    this.resendCooldown = 30;
    clearInterval(this.resendTimer);
    this.resendTimer = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) clearInterval(this.resendTimer);
      this.cdr.markForCheck();
    }, 1000);
  }

  onOtpKeyUp(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    if (event.key !== 'Backspace' && input.value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
    if (event.key === 'Backspace' && !input.value && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  }

  onOtpPaste(event: ClipboardEvent) {
    const paste = event.clipboardData?.getData('text') || '';
    const digits = paste.replace(/\D/g, '').slice(0, 6).split('');
    digits.forEach((d, i) => this.otpControls[i]?.setValue(d));
    document.getElementById(`otp-${Math.min(digits.length, 5)}`)?.focus();
    event.preventDefault();
  }

  onOtpFocus(event: FocusEvent) {
    (event.target as HTMLInputElement).select();
  }

  // ── Step 2: Choose Plan + Inline Payment ──────────────────────────

  private handleStep2() {
    if (!this.selectedPlan) {
      this.toastService.show('Please select a plan to continue.', 'error');
      return;
    }

    if (this.selectedPlan.price === 0) {
      this.isLoading = true;
      this.loadingText = 'Activating free plan...';
      this.subscriptionsService.subscribeTenant(
        this.registeredTenantId!,
        this.selectedPlan.id,
        (_res: any) => {
          this.isLoading = false;
          this.currentStep = this.steps.length;
          this.cdr.markForCheck();
        },
        (err: any) => {
          this.isLoading = false;
          this.toastService.show(err?.error?.message || 'Failed to activate plan.', 'error');
          this.cdr.markForCheck();
        }
      );
    } else {
      this.paymentForm.markAllAsTouched();
      if (this.paymentForm.invalid) return;

      this.isLoading = true;
      this.loadingText = 'Processing payment...';

      setTimeout(() => {
        this.subscriptionsService.subscribeTenant(
          this.registeredTenantId!,
          this.selectedPlan!.id,
          (_res: any) => {
            this.isLoading = false;
            this.currentStep = this.steps.length;
            this.cdr.markForCheck();
          },
          (err: any) => {
            this.isLoading = false;
            this.toastService.show(err?.error?.message || 'Payment failed. Please try again.', 'error');
            this.cdr.markForCheck();
          }
        );
      }, 1500);
    }
  }

  loadActivePlans() {
    this.plansLoading = true;
    this.cdr.markForCheck();
    this.subscriptionsService.getActivePlans(
      (res: any) => {
        this.activePlans = res?.data || [];
        this.plansLoading = false;
        this.cdr.markForCheck();
      },
      (_err: any) => {
        this.toastService.show('Failed to load plans. Please try again.', 'error');
        this.plansLoading = false;
        this.cdr.markForCheck();
      }
    );
  }

  // ── Success ───────────────────────────────────────────────────────

  get summaryRows() {
    const v = this.accountForm.value;
    return [
      { label: 'Company', value: v.companyName },
      { label: 'Admin', value: v.adminFullName },
      { label: 'Email', value: v.adminEmail },
      { label: 'Location', value: `${v.city}, ${v.state}` },
      { label: 'Status', value: 'Under review' },
    ];
  }

  goToDashboard() {
    this.isLoading = true;
    this.loadingText = 'Taking you to your dashboard...';
    this.authService.fetchUserInit().subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/']);
      },
      error: () => {
        this.isLoading = false;
        this.exitOnboardingEvent.emit();
      },
    });
  }
}