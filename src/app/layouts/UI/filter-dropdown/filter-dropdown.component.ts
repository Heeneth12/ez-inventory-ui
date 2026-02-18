import { Component, Input, Output, EventEmitter, signal, computed, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Filter, LucideAngularModule } from 'lucide-angular';

export interface FilterOption {
  id: string;
  label: string;
  type: 'checkbox' | 'radio';
  searchable?: boolean;
  options: { label: string; value: any; count?: number }[];
}

@Component({
  selector: 'app-filter-dropdown',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './filter-dropdown.component.html',
  styleUrls: ['./filter-dropdown.component.css']
})
export class FilterDropdownComponent {
  @Input() config: FilterOption[] = [];
  @Output() filterChanged = new EventEmitter<Record<string, any>>();
  @Input() set triggerReset(value: any) {
    if (value !== undefined && value !== null) {
      this.performReset();
    }
  }

  //icons
  readonly Filter = Filter;

  isOpen = signal(false);
  expandedCategories = signal<Set<string>>(new Set(['zones']));
  selectedFilters = signal<Record<string, any[]>>({});

  constructor(private eRef: ElementRef) { }


  // Replace this block
  totalSelectedCount = computed(() => {
    return Object.values(this.selectedFilters()).reduce((acc, curr) => {
      // Add safe navigation (?.) and a fallback (|| 0)
      return acc + (curr?.length || 0);
    }, 0);
  });

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    // If the click target is NOT inside this component, close the dropdown
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  toggleDropdown() {
    this.isOpen.update(v => !v);
  }

  toggleCategory(id: string) {
    const next = new Set(this.expandedCategories());
    next.has(id) ? next.delete(id) : next.add(id);
    this.expandedCategories.set(next);
  }

  isCategoryExpanded(id: string): boolean {
    return this.expandedCategories().has(id);
  }

  selectOption(filterId: string, value: any, type: string) {
    const current = { ...this.selectedFilters() };
    let values = [...(current[filterId] || [])];

    if (type === 'radio') {
      values = [value];
    } else {
      const index = values.indexOf(value);
      index > -1 ? values.splice(index, 1) : values.push(value);
    }

    current[filterId] = values;
    this.selectedFilters.set(current);
    this.filterChanged.emit(current);
  }

  isSelected(filterId: string, value: any): boolean {
    return this.selectedFilters()[filterId]?.includes(value) ?? false;
  }

  /**
   * Reset method to clear all selections and notify parent
   */
  performReset() {
    this.selectedFilters.set({});
    this.filterChanged.emit({});
    // Optional: Close dropdown on reset
    // this.isOpen.set(false); 
  }

  clearAll() {
    this.performReset();
  }
}