import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../guards/auth.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {

  constructor(private authSvs: AuthService) {}

  status: 'online' | 'away' | 'dnd' = 'online';
  isDND = false;
  toggleDND() {
    this.isDND = !this.isDND;
    this.status = this.isDND ? 'dnd' : 'online';
  }

  onLogout() {
    this.authSvs.logout();
  }

}
