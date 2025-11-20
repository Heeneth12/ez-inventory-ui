import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { ModalService } from './modalService';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent implements OnInit, OnDestroy {

  isOpen: boolean = false;
  content: TemplateRef<any> | null | undefined;
  context: any = null;
  private subscription = new Subscription();

  constructor(public modalService: ModalService) { }

  ngOnInit(): void {
    this.subscription.add(
      this.modalService.isOpen$.subscribe(v => this.isOpen = v)
    );
    this.subscription.add(
      this.modalService.content$.subscribe(v => this.content = v)
    );
    this.subscription.add(
      this.modalService.context$.subscribe(v => this.context = v)
    );
  }

  close() {
    this.modalService.close();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
