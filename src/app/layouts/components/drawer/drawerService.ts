import { Injectable, TemplateRef, Type } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type DrawerWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

@Injectable({
    providedIn: 'root'
})
export class DrawerService {

    private drawerState = new BehaviorSubject<boolean>(false);
    private drawerContent = new BehaviorSubject<TemplateRef<any> | Type<any> | null>(null);
    private drawerTitle = new BehaviorSubject<string>('Panel');
    private drawerWidth = new BehaviorSubject<DrawerWidth>('md');
    private drawerInputs = new BehaviorSubject<Record<string, any> | null>(null);


    drawerState$ = this.drawerState.asObservable();
    drawerContent$ = this.drawerContent.asObservable();
    drawerTitle$ = this.drawerTitle.asObservable();
    drawerWidth$ = this.drawerWidth.asObservable();
    drawerInputs$ = this.drawerInputs.asObservable();

    openTemplate(content: TemplateRef<any>, title: string = 'Panel', width: DrawerWidth = 'md') {
        this.drawerContent.next(content);
        this.drawerTitle.next(title);
        this.drawerWidth.next(width);
        this.drawerState.next(true);
    }

    openComponent(component: Type<any>, inputs: Record<string, any> = {}, title: string = 'Panel', width: DrawerWidth = 'md') {
        this.drawerContent.next(component);
        this.drawerInputs.next(inputs);
        this.drawerTitle.next(title);
        this.drawerWidth.next(width);
        this.drawerState.next(true);
    }

    close() {
        this.drawerState.next(false);
        this.drawerContent.next(null);
        this.drawerInputs.next(null);
    }
}
