import { Injectable, TemplateRef, Type } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

@Injectable({
    providedIn: 'root'
})
export class ModalService {
    private isOpenSubject = new BehaviorSubject<boolean>(false);
    isOpen$ = this.isOpenSubject.asObservable();

    private templateSubject = new BehaviorSubject<TemplateRef<any> | null>(null);
    template$ = this.templateSubject.asObservable();

    private componentSubject = new BehaviorSubject<Type<any> | null>(null);
    component$ = this.componentSubject.asObservable();

    private contextSubject = new BehaviorSubject<any>(null);
    context$ = this.contextSubject.asObservable();

    // Default size is 'md'
    private sizeSubject = new BehaviorSubject<ModalSize>('md');
    size$ = this.sizeSubject.asObservable();

    openTemplate(template: TemplateRef<any>, context: any = null, size: ModalSize = 'md') {
        this.componentSubject.next(null);
        this.templateSubject.next(template);
        this.contextSubject.next(context);
        this.sizeSubject.next(size); // Set size
        this.isOpenSubject.next(true);
    }

    openComponent(component: Type<any>, context: any = null, size: ModalSize = 'md') {
        this.templateSubject.next(null);
        this.componentSubject.next(component);
        this.contextSubject.next(context);
        this.sizeSubject.next(size); // Set size
        this.isOpenSubject.next(true);
    }

    close() {
        this.isOpenSubject.next(false);
        setTimeout(() => {
            this.templateSubject.next(null);
            this.componentSubject.next(null);
            this.contextSubject.next(null);
            this.sizeSubject.next('md'); // Reset size to default
        }, 300);
    }
}