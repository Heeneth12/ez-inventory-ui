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
  private readonly APP_KEY = 'EZH_INV_001';

  countries = [
    { code: '+91', label: 'IN (+91)', countryName: 'India' },
    { code: '+1', label: 'US (+1)', countryName: 'USA' },
    { code: '+44', label: 'UK (+44)', countryName: 'UK' },
    { code: '+971', label: 'UAE (+971)', countryName: 'UAE' },
    { code: '+61', label: 'AU (+61)', countryName: 'Australia' },
    { code: '+65', label: 'SG (+65)', countryName: 'Singapore' }
  ];

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private toastService:ToastService,
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
        name: ['', Validators.required], // Maps to adminFullName
        companyName: ['', Validators.required], // Maps to tenantName
        email: ['', [Validators.required, Validators.email]], // Maps to adminEmail
        password: ['', [Validators.required, Validators.minLength(8)]],
        countryCode: ['+91', Validators.required],
        phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],

        // Address Fields
        addressLine1: ['', Validators.required],
        addressLine2: [''],
        city: ['', Validators.required],
        state: ['', Validators.required],
        country: ['India', Validators.required],
        pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
      });
    }
  }

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.initForm();

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

      if (this.isLogin) {
        this.executeLogin(this.authForm.value);
      } else {
        this.executeRegistration();
      }
    } else {
      this.authForm.markAllAsTouched();
    }
  }

  private executeRegistration() {
    const formValue = this.authForm.value;
    const registerPayload = {
      tenantName: formValue.companyName,
      adminFullName: formValue.name,
      adminEmail: formValue.email,
      password: formValue.password,
      adminPhone: `${formValue.countryCode} ${formValue.phone}`,
      isPersonal: false, // Default value
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

    console.log("Sending Register Payload:", registerPayload);

    // 3. Call Service
    this.commonService.createTenant(registerPayload,
      (response: any) => {
        console.log("Registration Success", response);
        this.isLoading = false;
        this.toastService.show('Registration Successful!',"success")
        this.toggleMode();
      },
      (err: any) => {
        console.error("Registration Failed", err);
        this.isLoading = false;
        this.loadingText = 'Please wait...';
        alert('Registration Failed: ' + (err?.error?.message || 'Unknown error'));
      }
    );
  }

  initializeGoogleButton() {
    if (typeof google === 'undefined') {
      return;
    }
    const btnContainer = document.getElementById("google-btn-container");
    if (!btnContainer) {
      return;
    }
    google.accounts.id.initialize({
      client_id: this.googleClientId,
      callback: (response: any) => this.handleGoogleCredentialResponse(response)
    });
    google.accounts.id.renderButton(
      btnContainer,
      {
        theme: "outline",
        size: "large",
        width: "100%",
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "left"
      }
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
        (success) => { },
        (error) => {
          this.isLoading = false;
          alert('Google Sign-In Failed');
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