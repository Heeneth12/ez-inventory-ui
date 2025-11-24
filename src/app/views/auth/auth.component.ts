import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  constructor(private fb: FormBuilder) {
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
      this.isLoading = true;
      setTimeout(() => {
        console.log('Form Data:', this.authForm.value);
        this.isLoading = false;
      }, 1500);
    } else {
      this.authForm.markAllAsTouched();
    }
  }
}