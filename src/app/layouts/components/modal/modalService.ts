import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ModalService {
    private isOpenSubject = new BehaviorSubject<boolean>(false);
    public isOpen$ = this.isOpenSubject.asObservable();

    private contentSubject = new BehaviorSubject<TemplateRef<any> | null>(null);
    public content$ = this.contentSubject.asObservable();

    private contextSubject = new BehaviorSubject<any>(null);
    public context$ = this.contextSubject.asObservable();

    open(content: TemplateRef<any>, context: any = null) {
        this.contentSubject.next(content);
        this.contextSubject.next(context);
        this.isOpenSubject.next(true);
    }

    close() {
        this.isOpenSubject.next(false);
        setTimeout(() => {
            this.contentSubject.next(null);
            this.contextSubject.next(null);
        }, 300);
    }
}