import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ElementRef,
  TemplateRef,
  Type,
  ViewChild,
  ViewContainerRef,
  ChangeDetectorRef,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { combineLatest } from 'rxjs';
import { DrawerService } from './drawerService';
import '@tailwindplus/elements';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.css'
})
export class DrawerComponent implements OnInit {

  @ViewChild('drawerDialog') dialogRef!: ElementRef<HTMLDialogElement>;
  private _componentHost!: ViewContainerRef;
  get componentHost(): ViewContainerRef {
    return this._componentHost;
  }

  @ViewChild('componentHost', { read: ViewContainerRef })
  set componentHost(vcr: ViewContainerRef) {
    this._componentHost = vcr;
    if (this.currentContent) {
      this.loadDynamicComponent();
    }
  }
  widthClass = 'max-w-md';
  title$ = this.drawer.drawerTitle$;
  private currentContent: Type<any> | null = null;
  private currentInputs: Record<string, any> | null = null;

  constructor(
    public drawer: DrawerService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.drawer.drawerState$.subscribe(isOpen => {
      if (this.dialogRef?.nativeElement) {
        if (isOpen) {
          if (!this.dialogRef.nativeElement.open) {
            this.dialogRef.nativeElement.showModal();
          }
        } else {
          this.dialogRef.nativeElement.close();
        }
      }
    });

    this.drawer.drawerWidth$.subscribe(w => this.widthClass = this.getWidthClass(w));

    combineLatest([
      this.drawer.drawerContent$,
      this.drawer.drawerInputs$
    ]).subscribe(([content, inputs]) => {

      if (this.isComponent(content)) {
        this.currentContent = content as Type<any>;
        this.currentInputs = inputs;
        this.loadDynamicComponent();
      } else {
        this.currentContent = null;
        this.currentInputs = null;
        if (this.componentHost) this.componentHost.clear();
      }
    });
  }

  private loadDynamicComponent() {
    if (!this.componentHost || !this.currentContent) return;

    this.componentHost.clear();

    const componentRef = this.componentHost.createComponent(this.currentContent);

    if (this.currentInputs) {
      Object.entries(this.currentInputs).forEach(([key, value]) => {
        componentRef.setInput(key, value);
      });
    }
    componentRef.changeDetectorRef.detectChanges();
  }

  close() {
    this.drawer.close();
  }

  private getWidthClass(size: string): string {
    switch (size) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-2xl';
      case 'xl': return 'max-w-4xl';
      case '2xl': return 'max-w-6xl';
      case 'full': return 'max-w-full';
      default: return 'max-w-md';
    }
  }

  // Type Guards
  isTemplate(content: any): boolean {
    return content instanceof TemplateRef;
  }

  isComponent(content: any): boolean {
    return typeof content === 'function';
  }
}