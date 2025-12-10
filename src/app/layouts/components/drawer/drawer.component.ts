import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, Type } from '@angular/core';
import { Observable } from 'rxjs';
import { DrawerService } from './drawerService';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.css'
})
export class DrawerComponent implements OnInit {

  isOpen$!: Observable<boolean>;
  content$!: Observable<TemplateRef<any> | Type<any> | null>;
  title$!: Observable<string>;
  width$!: Observable<'sm' | 'md' | 'lg' | 'xl' | 'full'>;

  widthClass = 'w-full max-w-md';

  constructor(public drawer: DrawerService) { }

  ngOnInit() {
    this.isOpen$ = this.drawer.drawerState$;
    this.content$ = this.drawer.drawerContent$;
    this.title$ = this.drawer.drawerTitle$;
    this.width$ = this.drawer.drawerWidth$;

    // ✅ map width to class
    this.width$.subscribe(w => {
      this.widthClass = this.getWidthClass(w);
    });
  }

  private getWidthClass(size: 'sm' | 'md' | 'lg' |  'xl' | 'full'): string {
    switch (size) {
      case 'sm': return 'w-full max-w-sm';
      case 'md': return 'w-full max-w-md';
      case 'lg': return 'w-full max-w-2xl';
      case 'xl': return 'w-full max-w-4xl';
      case 'full': return 'w-full';
      default: return 'w-full max-w-md';
    }
  }

  close() {
    this.drawer.close();
  }

  isTemplateRef(content: any): content is TemplateRef<any> {
    return content instanceof TemplateRef;
  }

  isComponent(content: any): content is Type<any> {
    return typeof content === 'function';
  }
}
