import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../layouts/guards/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  isLogin = true;
  isLoading = false;
  authForm: FormGroup;

  constructor(private fb: FormBuilder, private authSvc: AuthService) {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      name: ['']
    });
  }

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.authForm.reset();
  }

  onSubmit() {
    if (this.authForm.valid) {
      this.authSvc.login(this.authForm.value,
        (response: any) => {
          console.log("success")
        },
        (error: any) => {
          console.log("error")
        }
      )
    } else {
      this.authForm.markAllAsTouched();
    }
  }
}