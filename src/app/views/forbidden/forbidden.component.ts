import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { LucideAngularModule, ShieldAlert, Home, ArrowLeft, Mail } from 'lucide-angular';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './forbidden.component.html',
  styleUrl: './forbidden.component.css'
})
export class ForbiddenComponent {
  readonly ShieldAlert = ShieldAlert;
  readonly Home = Home;
  readonly ArrowLeft = ArrowLeft;
  readonly Mail = Mail;

  constructor(
    private router: Router,
    private location: Location
  ) { }

  goBack() {
    this.location.back();
  }

  goHome() {
    this.router.navigate(['/']);
  }

  contactSupport() {
    // TODO: Implement contact support functionality
    window.location.href = 'mailto:support@example.com?subject=Access Request';
  }
}
