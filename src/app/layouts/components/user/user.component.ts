import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable} from 'rxjs';
import { AuthService } from '../../guards/auth.service';
import { UserInitResponse } from '../../models/Init-response.model';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css' // Ensure you have tailwind directives here
})
export class UserComponent implements OnInit {

  // Use Observable for AsyncPipe in template (Best Practice)
  userData$: Observable<UserInitResponse | null>;
  
  // Status Logic
  status: 'online' | 'away' | 'dnd' = 'online';
  isDND = false;

  constructor(private authSvs: AuthService) {
    this.userData$ = this.authSvs.currentUser$;
  }

  ngOnInit(): void {
    // No manual subscribe needed, the AsyncPipe handles it
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  toggleDND() {
    this.isDND = !this.isDND;
    this.status = this.isDND ? 'dnd' : 'online';
  }

  onLogout() {
    this.authSvs.logout();
  }
}