import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TutorialService } from '../../service/common/tutorial.service';
import { ModalService } from '../modal/modalService';

@Component({
  selector: 'app-promo-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './promo-modal.component.html',
  styleUrl: './promo-modal.component.css'
})
export class PromoModalComponent {

  private readonly STORAGE_KEY = 'catalyst_tour_completed';
  isVisible = true;


  constructor(
    private tutorialService: TutorialService,
    private modalService: ModalService
  ) {
    const hasSeenTour = localStorage.getItem(this.STORAGE_KEY);
    this.isVisible = hasSeenTour !== 'true';
  }


  onAction(id: string) {
    this.isVisible = false;
    this.markAsSeen();
    this.onClose();
    setTimeout(() => {
      this.tutorialService.startTour();
    }, 400);
  }

  onClose() {
    this.markAsSeen();
    this.isVisible = false;
    this.tutorialService.closeTour();
    this.modalService.close()
  }

  private markAsSeen() {
    localStorage.setItem(this.STORAGE_KEY, 'true');
  }

}
