import { Injectable, TemplateRef, Type } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type DrawerWidth = 'sm' | 'md' | 'lg' | 'xl' | 'full';

@Injectable({
    providedIn: 'root'
})
export class DrawerService {

    private drawerState = new BehaviorSubject<boolean>(false);
    private drawerContent = new BehaviorSubject<TemplateRef<any> | Type<any> | null>(null);
    private drawerTitle = new BehaviorSubject<string>('Panel');
    private drawerWidth = new BehaviorSubject<DrawerWidth>('md');

    drawerState$ = this.drawerState.asObservable();
    drawerContent$ = this.drawerContent.asObservable();
    drawerTitle$ = this.drawerTitle.asObservable();
    drawerWidth$ = this.drawerWidth.asObservable();

    openTemplate(content: TemplateRef<any>, title: string = 'Panel', width: DrawerWidth = 'md') {
        this.drawerContent.next(content);
        this.drawerTitle.next(title);
        this.drawerWidth.next(width);
        this.drawerState.next(true);
    }

    openComponent(component: Type<any>, title: string = 'Panel', width: DrawerWidth = 'md') {
        this.drawerContent.next(component);
        this.drawerTitle.next(title);
        this.drawerWidth.next(width);
        this.drawerState.next(true);
    }

    close() {
        this.drawerState.next(false);
    }
}
