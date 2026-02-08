import { Injectable, signal } from '@angular/core';

export type ModalIntent = 'danger' | 'info' | 'success' | 'neutral' | 'delete';

export interface ModalConfig {
  title: string;
  message: string;
  intent: ModalIntent;
  confirmLabel: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmationModalService {
  activeModal = signal<ModalConfig | null>(null);
  private resolveCallback?: (value: boolean) => void;

  open(config: ModalConfig): Promise<boolean> {
    this.activeModal.set({ ...config, isLoading: false });
    return new Promise((resolve) => {
      this.resolveCallback = resolve;
    });
  }

  close(result: boolean) {
    this.activeModal.set(null);
    this.resolveCallback?.(result);
  }

  setLoading(state: boolean) {
    const current = this.activeModal();
    if (current) this.activeModal.set({ ...current, isLoading: state });
  }
}