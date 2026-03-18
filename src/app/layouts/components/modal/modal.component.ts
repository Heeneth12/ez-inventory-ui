import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  OnDestroy,
  Type,
  ComponentRef,
  ViewContainerRef,
  ViewChild,
  ChangeDetectorRef,
  ElementRef,
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  AfterViewInit
} from '@angular/core';
import { ModalService, ModalSize, ModalState } from './modalService';
import { Subscription } from 'rxjs';
import '@tailwindplus/elements';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('modalDialog') dialogRef!: ElementRef<HTMLDialogElement>;
  @ViewChild('dynamicContainer', { read: ViewContainerRef }) dynamicContainer!: ViewContainerRef;

  state: ModalState | null = null;
  widthClass = 'sm:max-w-lg';

  private componentRef: ComponentRef<any> | null = null;
  private sub = new Subscription();

  constructor(
    public modalService: ModalService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.sub.add(
      this.modalService.isOpen$.subscribe(isOpen => {
        this.handleNativeDialog(isOpen);
      })
    );

    // 2. Handle Dynamic Component Loading separately
    this.sub.add(
      this.modalService.component$.subscribe(component => {
        if (component) {
          this.loadComponent(component, this.modalService.context);
        } else {
          this.destroyComponent();
        }
      })
    );
  }

  private handleNativeDialog(open: boolean) {
    if (!this.dialogRef?.nativeElement) return;

    const dialog = this.dialogRef.nativeElement;
    if (open && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    } else if (!open && dialog.open) {
      dialog.close();
      document.body.style.overflow = '';
    }
  }

  ngAfterViewInit(): void {
    if (this.state?.isOpen) {
      setTimeout(() => this.toggleDialog(true), 100);
    }
  }

  private toggleDialog(open: boolean) {
    if (!this.dialogRef?.nativeElement) {
      return;
    }

    try {
      if (open) {
        if (!this.dialogRef.nativeElement.open) {
          this.dialogRef.nativeElement.showModal();
          document.body.style.overflow = 'hidden';
        }
      } else {
        if (this.dialogRef.nativeElement.open) {
          this.dialogRef.nativeElement.close();
          document.body.style.overflow = '';
        }
      }
    } catch (e) {
      console.error('Error toggling dialog state:', e);
    }
  }

  private loadComponent(component: Type<any>, context: any) {
    if (!this.dynamicContainer) return;

    try {
      // 1. Clear previous content and destroy old component reference
      this.dynamicContainer.clear();
      this.destroyComponent();

      // 2. Instantiate the new component
      this.componentRef = this.dynamicContainer.createComponent(component);
      const instance = this.componentRef.instance;

      // 3. Map Context to Component Inputs
      if (context) {
        // Direct assignment for simple properties
        Object.assign(instance, context);

        // If using Angular Signals or newer Input transforms, 
        // check if you need to call setInput() instead:
        // Object.entries(context).forEach(([key, value]) => {
        //   this.componentRef?.setInput(key, value);
        // });
      }

      // 4. Handle Common Output Patterns (@Output / EventEmitter)
      // We check for 'close' and 'selected' event streams

      // Close Event
      if (instance.close?.subscribe) {
        this.sub.add(
          instance.close.subscribe(() => this.close())
        );
      }

      // Selected Event
      if (instance.selected?.subscribe) {
        this.sub.add(
          instance.selected.subscribe((data: any) => {
            if (context?.onSelected) {
              context.onSelected(data);
            }
          })
        );
      }

      // 5. Finalize Change Detection
      // detectChanges() ensures the view is rendered immediately
      // markForCheck() ensures the OnPush parent knows something changed
      this.componentRef.changeDetectorRef.detectChanges();
      this.cdr.markForCheck();

    } catch (e) {
      console.error('Error creating dynamic component in modal:', e);
    }
  }

  private destroyComponent() {
    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = null;
    }
  }

  close() {
    this.modalService.close();
  }

  public getWidthClass(size: ModalSize | any): string {
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
    this.sub.unsubscribe();
    this.destroyComponent();
    document.body.style.overflow = '';
  }
}