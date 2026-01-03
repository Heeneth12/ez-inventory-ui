import { Component, OnInit, OnDestroy } from '@angular/core'; // Added OnDestroy
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../layouts/guards/auth.service';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from "lucide-angular";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {
  isLogin = true;
  isLoading = false;
  loadingText = 'Please wait...';
  authForm: FormGroup;
  private routeSub: Subscription | undefined;

  constructor(private fb: FormBuilder,
    private authSvc: AuthService,
    private route: ActivatedRoute
  ) {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      name: ['']
    });
  }

  ngOnInit() {
    this.routeSub = this.route.queryParams.subscribe(params => {
      if (params['demo'] === 'true') {
        this.onDemoLogin();
      }
    });
  }

  ngOnDestroy() {
      // Clean up subscriptions
      if (this.routeSub) this.routeSub.unsubscribe();
  }

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.authForm.reset();
  }

  onDemoLogin() {
    this.isLoading = true;
    this.loadingText = 'Detected demo link. Spinning up your environment...';
    
    setTimeout(() => {
      const demoCredentials = {
        email: 'demo@ezh.com',
        password: '' 
      };

      this.executeLogin(demoCredentials);
    }, 1500);
  }

  onSubmit() {
    if (this.authForm.valid) {
      this.isLoading = true;
      this.loadingText = 'Signing in...';
      this.executeLogin(this.authForm.value);
    } else {
      this.authForm.markAllAsTouched();
    }
  }

  // Refactored shared login logic
  private executeLogin(credentials: any) {
    this.authSvc.login(credentials,
        (response: any) => {
          // Success: The service handles navigation. 
          // We don't need to set isLoading = false because this component is about to be destroyed.
          console.log("Login success");
        },
        (error: any) => {
          console.error("Login error", error);
          this.isLoading = false;
          this.loadingText = 'Please wait...';
        }
      );
  }
}