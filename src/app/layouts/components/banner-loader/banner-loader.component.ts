import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BannerLoaderService } from './banner-loader.service';


@Component({
  selector: 'app-banner-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
     @if (loaderService.isLoading$ | async) {
      <div class="loader-overlay flex flex-col items-center justify-center fixed inset-0 z-[9999] bg-[#f3f2ef]">
        <div class="mb-4">
          <h1 class="text-[#0a66c2] text-5xl font-extrabold tracking-tighter flex items-center">
            <span class="ml-1 text-[#E86426] px-1 leading-none py-0.5">EZ</span>
            Inventory
          </h1>
        </div>
        <div class="w-48 h-[2px] bg-gray-300 overflow-hidden relative rounded-full">
          <div class="loader-bar absolute h-full bg-[#0a66c2]"></div>
        </div>
      </div>
    }
  `,
  styles: [`
    .loader-overlay {
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slide-infinite {
      0% { width: 0%; left: 0%; }
      50% { width: 100%; left: 0%; }
      100% { width: 0%; left: 100%; }
    }

    .loader-bar {
      animation: slide-infinite 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }
  `]
})
export class BannerLoaderComponent {
  isLoading = false;
  loaderService = inject(BannerLoaderService);

  constructor() {
    this.loaderService.isLoading$.subscribe(v => this.isLoading = v);
  }
}