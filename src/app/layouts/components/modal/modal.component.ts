import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  OnDestroy,
  TemplateRef,
  Type,
  ComponentRef,
  ViewContainerRef,
  ViewChild,
  ChangeDetectorRef,
  ElementRef,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { ModalService, ModalSize } from './modalService';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import '@tailwindplus/elements';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent implements OnInit, OnDestroy {

  @ViewChild('modalDialog') dialogRef!: ElementRef<HTMLDialogElement>;
  @ViewChild('dynamicContainer', { read: ViewContainerRef })
  dynamicContainer!: ViewContainerRef;

  isOpen = false;
  template: TemplateRef<any> | null = null;
  context: any = null;
  size: ModalSize = 'md';
  widthClass = 'sm:max-w-lg';

  private componentRef: ComponentRef<any> | null = null;
  private subscription = new Subscription();

  constructor(
    public modalService: ModalService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // 1. Subscribe to OPEN/CLOSE
    this.subscription.add(
      this.modalService.isOpen$.pipe(distinctUntilChanged()).subscribe(isOpen => {
        this.isOpen = isOpen;
        // Add a small delay or check to ensure DOM is ready
        setTimeout(() => {
          if (this.dialogRef?.nativeElement) {
            if (isOpen) {
              this.dialogRef.nativeElement.showModal();
            } else {
              this.dialogRef.nativeElement.close();
            }
          }
        }, 0);
      })
    );

    // 2. Subscribe to COMPONENT
    this.subscription.add(
      this.modalService.component$.subscribe(component => {
        if (component) {
          setTimeout(() => this.loadComponent(component), 0);
        }
      })
    );

    // 3. Subscribe to TEMPLATE
    this.subscription.add(
      this.modalService.template$.subscribe(t => this.template = t)
    );

    // 4. Subscribe to CONTEXT
    this.subscription.add(
      this.modalService.context$.subscribe(ctx => {
        this.context = ctx;
        if (this.componentRef) {
          Object.assign(this.componentRef.instance, this.context);
          this.componentRef.changeDetectorRef.detectChanges();
        }
      })
    );

    // 5. Subscribe to SIZE
    this.subscription.add(
      this.modalService.size$.subscribe(size => {
        this.size = size;
        this.widthClass = this.getWidthClass(size);
      })
    );
  }

  private loadComponent(component: Type<any>) {
    if (!this.dynamicContainer) return;

    this.dynamicContainer.clear();

    if (this.componentRef) {
      this.componentRef.destroy();
    }

    // Create Component
    this.componentRef = this.dynamicContainer.createComponent(component);

    // Pass Data (Inputs)
    if (this.context) {
      Object.assign(this.componentRef.instance, this.context);
    }

    // Listen to Close (SAFE CHECK ADDED HERE)
    const instance = this.componentRef.instance;
    if (instance.close && typeof instance.close.subscribe === 'function') {
      this.subscription.add(
        instance.close.subscribe(() => this.close())
      );
    }

    // Force Update
    this.componentRef.changeDetectorRef.detectChanges();
  }

  close() {
    this.modalService.close();
  }

  private getWidthClass(size: ModalSize): string {
    switch (size) {
      case 'sm': return 'sm:max-w-sm';
      case 'md': return 'sm:max-w-lg';
      case 'lg': return 'sm:max-w-4xl';
      case 'xl': return 'sm:max-w-7xl';
      case 'full': return 'sm:w-full sm:max-w-none sm:m-4 sm:h-[95vh]';
      default: return 'sm:max-w-lg';
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.componentRef) this.componentRef.destroy();
  }
}