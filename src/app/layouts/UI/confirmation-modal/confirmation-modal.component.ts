import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewChild,
  effect,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { ConfirmationModalService, ModalIntent } from './confirmation-modal.service';
import { CircleX, Info, LucideAngularModule, Settings2, Trash2 } from 'lucide-angular';
import '@tailwindplus/elements';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.css'
})
export class ConfirmationModalComponent {

  // Reference to the native dialog element
  @ViewChild('confirmDialog') dialogRef!: ElementRef<HTMLDialogElement>;

  // Icons
  readonly CircleX = CircleX;
  readonly Trash2 = Trash2;
  readonly Settings2 = Settings2;
  readonly Info = Info;

  constructor(public modalSvc: ConfirmationModalService) {
    // Watch the signal: Open/Close dialog automatically
    effect(() => {
      const isOpen = !!this.modalSvc.activeModal();
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
  }

  getIcon(intent: ModalIntent): any {
    switch (intent) {
      case 'danger': return this.Trash2;
      case 'delete': return this.Trash2;
      case 'info': return this.Info;
      case 'success': return this.CircleX;
      case 'neutral': return this.CircleX;
      default: return 'help_outline';
    }
  }
}