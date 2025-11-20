
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private toastsSubject = new BehaviorSubject<Toast[]>([]);
    public toasts$ = this.toastsSubject.asObservable();
    private counter = 0;

    show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 3000) {
        const id = this.counter++;
        const toast: Toast = { id, message, type, duration };
        // Add to stack
        this.toastsSubject.next([...this.toastsSubject.value, toast]);
        // Auto remove
        if (duration > 0) {
            setTimeout(() => this.remove(id), duration);
        }
    }

    remove(id: number) {
        const current = this.toastsSubject.value;
        this.toastsSubject.next(current.filter(t => t.id !== id));
    }
}