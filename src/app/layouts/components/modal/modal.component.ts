import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, TemplateRef, Type, ComponentRef, ViewContainerRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ModalService, ModalSize } from './modalService';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent implements OnInit, OnDestroy {

  isOpen = false;
  template: TemplateRef<any> | null = null;
  context: any = null;
  size: ModalSize = 'md';

  @ViewChild('dynamicContainer', { read: ViewContainerRef })
  dynamicContainer!: ViewContainerRef;

  private componentRef: ComponentRef<any> | null = null;
  private pendingComponent: Type<any> | null = null;
  private subscription = new Subscription();

  constructor(
    public modalService: ModalService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // 1. Subscribe to Component Changes
    this.subscription.add(
      this.modalService.component$.subscribe(component => {
        this.pendingComponent = component;
        
        // Edge Case: If modal is ALREADY open and we are swapping components, load immediately.
        if (this.isOpen && component && !this.template) {
          this.cdr.detectChanges(); 
          this.loadComponent(component);
        }
      })
    );

    // 2. Subscribe to Template Changes
    this.subscription.add(
      this.modalService.template$.subscribe(template => {
        this.template = template;
      })
    );

    // 3. Subscribe to Context Changes (Data passing)
    this.subscription.add(
      this.modalService.context$.subscribe(ctx => {
        this.context = ctx;
        // Update inputs on the existing component instance if context changes while open
        if (this.componentRef && this.context) {
          Object.assign(this.componentRef.instance, this.context);
          this.componentRef.injector.get(ChangeDetectorRef).detectChanges();
        }
      })
    );

    // 4. Subscribe to Size Changes
    this.subscription.add(
      this.modalService.size$.subscribe(size => {
        this.size = size;
      })
    );

    // 5. Subscribe to Open/Close State
    this.subscription.add(
      this.modalService.isOpen$.pipe(distinctUntilChanged()).subscribe(isOpen => {
        this.isOpen = isOpen;
        
        if (isOpen) {
          // STEP A: Force Angular to render the HTML (specifically the *ngIf block)
          // This ensures #dynamicContainer exists in the DOM.
          this.cdr.detectChanges(); 

          // STEP B: Now that the DOM exists, load the pending component if needed
          if (!this.template && this.pendingComponent) {
            this.loadComponent(this.pendingComponent);
          }
        }
      })
    );
  }

  private loadComponent(component: Type<any>) {
    // Safety check: if view is still not ready, log warning and exit
    if (!this.dynamicContainer) {
        console.warn('Modal: dynamicContainer not found yet. Ensure *ngIf is true.');
        return;
    }

    // Clear previous content
    this.dynamicContainer.clear();

    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = null;
    }

    // Create the component dynamically
    this.componentRef = this.dynamicContainer.createComponent(component);

    // Pass context as inputs to the child component
    if (this.context) {
      Object.assign(this.componentRef.instance, this.context);
    }
    
    // Wire up the 'close' Output if the child component has one
    if (this.componentRef.instance.close) {
        this.subscription.add(
            this.componentRef.instance.close.subscribe(() => this.close())
        );
    }
    
    // Refresh the child component's view to ensure inputs are rendered
    this.componentRef.changeDetectorRef.detectChanges();
  }

  close() {
    this.modalService.close();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.componentRef) this.componentRef.destroy();
  }
}