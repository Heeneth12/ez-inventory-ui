import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

// --- Reusable Interfaces ---
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
  styleUrls: ['./tab-card.component.css']
})
export class TabCardComponent {
  @Input() tabs: TabItem[] = [];
  @Input() activeTabId: string = '';
  @Output() activeTabIdChange = new EventEmitter<string>();

  selectTab(id: string) {
    this.activeTabId = id;
    this.activeTabIdChange.emit(id);
    console.log('Selected Tab ID:', id);
  }

  getTabClass(tabId: string): string {
    const isActive = this.activeTabId === tabId;
    return isActive
      ? 'bg-blue-200 text-slate-800 border-t border-x border-slate-100'
      : 'bg-slate-50 text-slate-500 hover:text-slate-700 border-transparent z-10 ';
  }
}