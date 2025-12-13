import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, Type, ViewChild, ViewContainerRef, ChangeDetectorRef } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
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

  // Store the current data to render
  private currentContent: Type<any> | null = null;
  private currentInputs: Record<string, any> | null = null;

  // 1. Internal reference to the host
  private _componentHost!: ViewContainerRef;

  // 2. Use a Setter! 
  // This triggers automatically when *ngIf renders the element.
  @ViewChild('componentHost', { read: ViewContainerRef })
  set componentHost(vcr: ViewContainerRef) {
    this._componentHost = vcr;
    // If we have a host AND content waiting, load it now
    if (vcr && this.currentContent) {
      this.loadDynamicComponent();
    }
  }

  get componentHost(): ViewContainerRef {
    return this._componentHost;
  }

  constructor(
    public drawer: DrawerService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.isOpen$ = this.drawer.drawerState$;
    this.content$ = this.drawer.drawerContent$;
    this.title$ = this.drawer.drawerTitle$;
    this.width$ = this.drawer.drawerWidth$;

    this.width$.subscribe(w => this.widthClass = this.getWidthClass(w));

    // 3. Subscribe to data changes
    combineLatest([
      this.drawer.drawerContent$,
      this.drawer.drawerInputs$
    ]).subscribe(([content, inputs]) => {

      // Save the data for later (in case the View isn't ready)
      if (this.isComponent(content)) {
        this.currentContent = content;
        this.currentInputs = inputs;
        this.loadDynamicComponent(); // Try to load immediately
      } else {
        this.currentContent = null;
        this.currentInputs = null;
        if (this.componentHost) this.componentHost.clear();
      }
    });
  }

  // 4. Dedicated logic to create the component
  private loadDynamicComponent() {
    if (!this.componentHost || !this.currentContent) return;

    this.componentHost.clear();

    const componentRef = this.componentHost.createComponent(this.currentContent);

    if (this.currentInputs) {
      Object.entries(this.currentInputs).forEach(([key, value]) => {
        componentRef.setInput(key, value);
      });
    }

    // Force check to ensure inputs apply visually if inside OnPush
    componentRef.changeDetectorRef.detectChanges();
  }

  private getWidthClass(size: 'sm' | 'md' | 'lg' | 'xl' | 'full'): string {
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