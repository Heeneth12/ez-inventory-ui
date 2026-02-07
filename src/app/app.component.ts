import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InventoryLayoutComponent } from "./layouts/components/inventory-layout/inventory-layout.component";
import { AuthService } from './layouts/guards/auth.service';
import { ToastComponent } from "./layouts/components/toast/toast.component";
import { BannerLoaderComponent } from "./layouts/components/banner-loader/banner-loader.component";
import { VendorLayoutComponent } from "./layouts/components/vendor-layout/vendor-layout.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, InventoryLayoutComponent, ToastComponent, BannerLoaderComponent, VendorLayoutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'inventory-management-system';

  constructor(public authSvc: AuthService) { }

}