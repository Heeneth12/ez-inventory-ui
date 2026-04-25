import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { BannerLoaderService } from './banner-loader.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-banner-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isLoading) {
      <div class="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center step-fade">
        
        <div class="w-full max-w-sm px-6 text-center">
          
          <h1 class="text-ez-hero font-medium text-ez-heading tracking-normal leading-tight mb-8">
            Kubee
          </h1>

          <div class="w-48 h-[2px] bg-ez-border overflow-hidden mx-auto mb-6">
            <div class="loader-bar h-full bg-ez-primary"></div>
          </div>

          <div class="flex items-center justify-center gap-3 text-ez-secondary">
            <svg class="w-4 h-4 animate-spin text-ez-heading" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.15" />
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
            </svg>
            <span class="text-ez-sm font-medium transition-opacity duration-ez">
              {{ currentMessage }}
            </span>
          </div>

        </div>

      </div>
    }
  `,
  styles: [`
    @keyframes slide-infinite {
      0% { width: 0%; transform: translateX(-100%); }
      50% { width: 100%; transform: translateX(0%); }
      100% { width: 0%; transform: translateX(200%); }
    }

    .loader-bar {
      animation: slide-infinite 1.5s cubic-bezier(0.5, 0, 0, 0.75) infinite;
    }
  `]
})
export class BannerLoaderComponent implements OnInit, OnDestroy {

  isLoading = false;
  loaderService = inject(BannerLoaderService);

  // Subscription management
  private loaderSub!: Subscription;
  private messageIntervalId: any;

  // Message Rotation Logic - Refined to match the minimal/technical aesthetic
  loadingMessages = [
    'Authenticating session...',
    'Retrieving workspace data...',
    'Loading inventory...',
    'Finalizing setup...'
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
    this.messageIndex = 0;
    this.currentMessage = this.loadingMessages[0];

    // Change message every 2.5 seconds
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
    this.stopMessageRotation();
    if (this.loaderSub) {
      this.loaderSub.unsubscribe();
    }
  }
}