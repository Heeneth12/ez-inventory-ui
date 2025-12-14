import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: any;
}

@Component({
  selector: 'app-tab-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './tab-card.component.html',
  styles: [`
    /* Hide scrollbar for Chrome, Safari and Opera */
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }
    /* Hide scrollbar for IE, Edge and Firefox */
    .no-scrollbar {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
    }
  `]
})
export class TabCardComponent {
  @Input() tabs: TabItem[] = [];
  @Input() activeTabId: string = '';
  @Output() activeTabIdChange = new EventEmitter<string>();

  selectTab(id: string) {
    if (this.activeTabId !== id) {
      this.activeTabId = id;
      this.activeTabIdChange.emit(id);
    }
  }
}