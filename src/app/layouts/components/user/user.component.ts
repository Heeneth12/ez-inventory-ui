import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {

  status: 'online' | 'away' | 'dnd' = 'online';
  isDND = false;
  toggleDND() {
    this.isDND = !this.isDND;
    this.status = this.isDND ? 'dnd' : 'online';
  }

  onLogout() {
    console.log('Logout');
  }

}
