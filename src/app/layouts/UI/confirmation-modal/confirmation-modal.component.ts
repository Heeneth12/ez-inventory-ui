import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ConfirmationModalService, ModalIntent } from './confirmation-modal.service';
import { CircleX, Info, LucideAngularModule, Settings2, Trash2 } from 'lucide-angular';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.css'
})
export class ConfirmationModalComponent {
  constructor(public modalSvc: ConfirmationModalService) {}

  //icon 
  readonly CircleX = CircleX;
  readonly Trash2 = Trash2;
  readonly Settings2 = Settings2;
  readonly Info = Info;

  /**
   * Returns appropriate Material Icon string based on modal intent
   */
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