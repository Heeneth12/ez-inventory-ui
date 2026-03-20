import { Injectable, TemplateRef, Type } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalState {
    isOpen: boolean;
    template: TemplateRef<any> | null;
    component: Type<any> | null;
    context: any;
    size: ModalSize;
}

@Injectable({
    providedIn: 'root'
})
export class ModalService {
    private initialState: ModalState = {
        isOpen: false,
        template: null,
        component: null,
        context: null,
        size: 'md'
    };

    private stateSubject = new BehaviorSubject<ModalState>(this.initialState);
    
    // Core state observable
    state$ = this.stateSubject.asObservable();

    // Sliced observables for individual subscriptions (keeps code clean and optimized)
    isOpen$ = this.stateSubject.pipe(map(s => s.isOpen), distinctUntilChanged());
    context$ = this.stateSubject.pipe(map(s => s.context));
    component$ = this.stateSubject.pipe(map(s => s.component), distinctUntilChanged());
    size$ = this.stateSubject.pipe(map(s => s.size), distinctUntilChanged());

    get context() {
        return this.stateSubject.value.context;
    }

    openTemplate(template: TemplateRef<any>, context: any = null, size: ModalSize = 'md') {
        this.stateSubject.next({
            isOpen: true,
            template,
            component: null,
            context,
            size
        });
    }

    openComponent(component: Type<any>, context: any = null, size: ModalSize = 'md') {
        this.stateSubject.next({
            isOpen: true,
            template: null,
            component,
            context,
            size
        });
    }

    close() {
        const currentState = this.stateSubject.value;
        this.stateSubject.next({ ...currentState, isOpen: false });

        // Complete cleanup after animation
        setTimeout(() => {
            if (!this.stateSubject.value.isOpen) {
                this.stateSubject.next(this.initialState);
            }
        }, 300);
    }
}