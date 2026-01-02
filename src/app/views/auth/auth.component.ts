import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../layouts/guards/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../layouts/components/toast/toastService';
import { LucideAngularModule } from "lucide-angular";

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  isLogin = true;
  isLoading = false;
  loadingText = 'Please wait...';
  authForm: FormGroup;

  constructor(private fb: FormBuilder,
    private authSvc: AuthService,
    private route: ActivatedRoute,
    private toastSvc: ToastService
  ) {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      name: ['']
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      // Check if 'demo' param exists and is 'true'
      if (params['demo'] === 'true') {
        this.onDemoLogin();
      }
    });
  }

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.authForm.reset();
  }

  onDemoLogin() {
    this.isLoading = true;
    // Set the specific message requested
    this.loadingText = 'Detected demo link. Spinning up your environment...';
    // Simulate a small delay (e.g., 1.5 seconds) to make it feel like it's "spinning up"
    setTimeout(() => {
      const demoCredentials = {
        email: 'demo@ezh.com', // Hardcoded Demo Email
        password: 'Pass1234'    // Hardcoded Demo Password
      };

      this.authSvc.login(demoCredentials,
        (response: any) => {
          console.log("Demo login success");
          // Navigate or handle success here
        },
        (error: any) => {
          console.log("Demo login error");
          this.isLoading = false;
          this.loadingText = 'Please wait...'; // Reset text
        }
      );
    }, 1500);
  }

  onSubmit() {
    if (this.authForm.valid) {
      this.isLoading = true;
      this.loadingText = 'Signing in...'; // Standard text for normal login
      this.authSvc.login(this.authForm.value,
        (response: any) => {
          console.log("success");
          // this.isLoading = false; // Usually handled by redirect
        },
        (error: any) => {
          console.log("error");
          this.isLoading = false;
        }
      );
    } else {
      this.authForm.markAllAsTouched();
    }
  }
}