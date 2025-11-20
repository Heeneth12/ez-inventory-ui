import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DrawerService {

    private drawerState = new BehaviorSubject<boolean>(false);
    private drawerContent = new BehaviorSubject<any>(null);
    private drawerTitle = new BehaviorSubject<string>('Panel');

    drawerState$ = this.drawerState.asObservable();
    drawerContent$ = this.drawerContent.asObservable();
    drawerTitle$ = this.drawerTitle.asObservable();

    open(content: any, title: string = 'Panel') {
        this.drawerContent.next(content);
        this.drawerTitle.next(title);
        this.drawerState.next(true);
    }

    close() {
        this.drawerState.next(false);
    }
}
