import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, computed, signal } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
export type ColumnType = 'text' | 'currency' | 'date' | 'status' | 'user-profile' | 'index' | 'actions';

export interface TableColumn {
  key: string;
  label: string;
  type: ColumnType;
  sortable?: boolean;
  minWidth?: string;
}

export interface ToolbarTab {
  id: string;
  label: string;
}


@Component({
  selector: 'app-table-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-toolbar.component.html',
  styleUrls: ['./table-toolbar.component.css']
})
export class TableToolbarComponent {
  @Input({ required: true }) tabs: ToolbarTab[] = [];
  @Input({ required: true }) activeTab: string = '';
  @Input() createLabel: string = 'New Item';

  @Output() tabChange = new EventEmitter<string>();
  @Output() actionTrigger = new EventEmitter<'export' | 'create'>();

  onTabClick(id: string) {
    this.tabChange.emit(id);
  }

  onAction(type: 'export' | 'create') {
    this.actionTrigger.emit(type);
  }
}