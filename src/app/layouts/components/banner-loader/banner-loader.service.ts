import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class BannerLoaderService {

    private isLoadingSubject = new BehaviorSubject<boolean>(false);
    public isLoading$ = this.isLoadingSubject.asObservable();

    constructor() { }

    /**
     * Shows the full screen loader
     */
    show(): void {
        this.isLoadingSubject.next(true);
    }

    /**
     * Hides the full screen loader
     */
    hide(): void {
        this.isLoadingSubject.next(false);
    }
}