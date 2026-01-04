import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../layouts/guards/auth.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {
  isLogin = true;
  isLoading = false;
  loadingText = 'Please wait...';
  authForm!: FormGroup;
  private routeSub: Subscription | undefined;

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
    private route: ActivatedRoute
  ) {
    this.initForm(); // Initialize form logic extracted to function
  }

  ngOnInit() {
    this.routeSub = this.route.queryParams.subscribe(params => {
      if (params['demo'] === 'true') {
        this.onDemoLogin();
      }
    });
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
    this.initForm(); // Re-initialize form controls when switching
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