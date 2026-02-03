import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InventoryLayoutComponent } from "./layouts/components/inventory-layout/inventory-layout.component";
import { AuthService } from './layouts/guards/auth.service';
import { ToastComponent } from "./layouts/components/toast/toast.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, InventoryLayoutComponent, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'inventory-management-system';

  constructor(public authSvc: AuthService) { }

}