import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { BannerLoaderService } from './banner-loader.service';
import { Subscription } from 'rxjs';
import { LucideAngularModule, Settings } from 'lucide-angular';

@Component({
  selector: 'app-banner-loader',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
     @if (isLoading) {
      <div class="loader-overlay flex flex-col items-center justify-center fixed inset-0 z-[9999] bg-[#f3f2ef]">
        
        <div class="mb-4">
          <h1 class="text-[#0a66c2] text-5xl font-extrabold tracking-tighter flex items-center">
            <span class="ml-1 text-[#E86426] px-1 leading-none py-0.5">EZ</span>
            Inventory
          </h1>
        </div>

        <div class="w-48 h-[2px] bg-gray-300 overflow-hidden relative rounded-full mb-4">
          <div class="loader-bar absolute h-full bg-[#0a66c2]"></div>
        </div>

        <div class="flex items-center space-x-2 text-[#0a66c2]">

        <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          <span class="text-sm font-medium transition-all duration-300 ease-in-out">
            {{ currentMessage }}
          </span>
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
export class BannerLoaderComponent implements OnInit, OnDestroy {

  //icon
  readonly settingIcon = Settings;

  isLoading = false;
  loaderService = inject(BannerLoaderService);

  // Subscription management
  private loaderSub!: Subscription;
  private messageIntervalId: any;

  // Message Rotation Logic
  loadingMessages = [
    'Spinning up your account...',
    'Please wait, almost there...',
    'Loading your inventory data...',
    'Setting things up...'
  ];
  currentMessage = this.loadingMessages[0];
  private messageIndex = 0;

  ngOnInit() {
    this.loaderSub = this.loaderService.isLoading$.subscribe(v => {
      this.isLoading = v;
      if (v) {
        this.startMessageRotation();
      } else {
        this.stopMessageRotation();
      }
    });
  }

  private startMessageRotation() {
    // Reset to the first message when loader starts
    this.messageIndex = 0;
    this.currentMessage = this.loadingMessages[0];

    // Change message every 2.5 seconds (2500ms)
    this.messageIntervalId = setInterval(() => {
      this.messageIndex = (this.messageIndex + 1) % this.loadingMessages.length;
      this.currentMessage = this.loadingMessages[this.messageIndex];
    }, 2500);
  }

  private stopMessageRotation() {
    if (this.messageIntervalId) {
      clearInterval(this.messageIntervalId);
    }
  }

  ngOnDestroy() {
    // Clean up to prevent memory leaks
    this.stopMessageRotation();
    if (this.loaderSub) {
      this.loaderSub.unsubscribe();
    }
  }
}