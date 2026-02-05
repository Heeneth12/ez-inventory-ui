import { Component, Input, Output, EventEmitter, OnInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export type DatePickerType = 'single' | 'both';

export interface DatePickerConfig {
  type: DatePickerType;
  label?: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  dateFormat?: Intl.DateTimeFormatOptions;
}

export interface DateRangeEmit {
  from: Date | null;
  to: Date | null;
}

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css']
})
export class DatePickerComponent implements OnInit {
  
  @Input() config: DatePickerConfig = { type: 'single', label: 'Select Date' };
  @Output() dateSelect = new EventEmitter<DateRangeEmit>();
  @Output() reset = new EventEmitter<void>();
  @Input() set triggerReset(value: any) {
    if (value !== undefined && value !== null) {
      this.performReset();  
    }
  }
  // State
  isOpen = false;
  currentViewDate: Date = new Date();
  selectedFrom: Date | null = null;
  selectedTo: Date | null = null;

  // Calendar Data
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  daysInMonth: Date[] = [];

  constructor(private eRef: ElementRef) { }

  ngOnInit() {
    this.generateCalendar();
  }

  // --- UI Toggles ---
  toggleCalendar() {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.selectedFrom) {
      // Jump to the month of the selected date when opening
      this.currentViewDate = new Date(this.selectedFrom);
      this.generateCalendar();
    }
  }

  closeCalendar() {
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.closeCalendar();
    }
  }

  // --- Date Logic ---
  generateCalendar() {
    const year = this.currentViewDate.getFullYear();
    const month = this.currentViewDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const days: Date[] = [];

    // Fill padding days from previous month
    for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
      const d = new Date(year, month, 1 - (firstDayOfMonth.getDay() - i));
      days.push(d);
    }

    // Fill actual days
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    this.daysInMonth = days;
  }

  changeMonth(step: number) {
    this.currentViewDate = new Date(
      this.currentViewDate.getFullYear(),
      this.currentViewDate.getMonth() + step,
      1
    );
    this.generateCalendar();
  }

  // --- Selection Logic ---
  selectDate(date: Date) {
    // Reset time to 00:00:00 for accurate comparison
    const cleanDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (this.config.type === 'single') {
      this.selectedFrom = cleanDate;
      this.emitData();
      this.closeCalendar();
      return;
    }

    // Range Logic ('both')
    if (!this.selectedFrom || (this.selectedFrom && this.selectedTo)) {
      // Start a new selection
      this.selectedFrom = cleanDate;
      this.selectedTo = null;
    } else {
      // Completing the range
      if (cleanDate < this.selectedFrom) {
        this.selectedTo = this.selectedFrom;
        this.selectedFrom = cleanDate;
      } else {
        this.selectedTo = cleanDate;
      }
      this.emitData();
      this.closeCalendar();
    }
  }

  emitData() {
    this.dateSelect.emit({
      from: this.selectedFrom,
      to: this.selectedTo
    });
  }

  // --- Helpers for Template ---
  isSameDate(d1: Date | null, d2: Date): boolean {
    if (!d1) return false;
    return d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
  }

  isInRange(date: Date): boolean {
    if (!this.selectedFrom || !this.selectedTo) return false;
    return date > this.selectedFrom && date < this.selectedTo;
  }

  // Styling helper
  getDayClasses(date: Date): string {
    const isCurrentMonth = date.getMonth() === this.currentViewDate.getMonth();
    const base = "w-10 h-10 flex items-center justify-center rounded-full text-sm cursor-pointer transition-all duration-200 ";

    if (this.isSameDate(this.selectedFrom, date) || this.isSameDate(this.selectedTo, date)) {
      return base + "bg-blue-600 text-white font-semibold shadow-lg scale-105 z-10";
    }

    if (this.isInRange(date)) {
      return base + "bg-blue-100 text-blue-700 rounded-none";
    }

    if (!isCurrentMonth) {
      return base + "text-gray-300 hover:text-gray-500";
    }

    return base + "text-gray-700 hover:bg-gray-100";
  }

  get formattedDisplay(): string {
    const opts: Intl.DateTimeFormatOptions = this.config.dateFormat || { day: 'numeric', month: 'short', year: 'numeric' };

    if (!this.selectedFrom) return '';

    const fromStr = this.selectedFrom.toLocaleDateString('en-US', opts);

    if (this.config.type === 'single') return fromStr;

    if (this.config.type === 'both') {
      const toStr = this.selectedTo ? this.selectedTo.toLocaleDateString('en-US', opts) : '...';
      return `${fromStr} - ${toStr}`;
    }
    return '';
  }

  public performReset() {
    this.selectedFrom = null;
    this.selectedTo = null;
    this.currentViewDate = new Date();
    this.generateCalendar();
    this.emitData();
    this.closeCalendar();
    this.reset.emit();
  }
}

// Demo Example
// @Component({
//   selector: 'app-root',
//   standalone: true,
//   imports: [DatePickerComponent],
//   template: `
//     <div class="min-h-screen bg-gray-50 p-10 flex flex-col gap-10 items-center">
      
//       <div class="w-full max-w-md">
//         <h2 class="text-xl font-bold mb-4">Single Selection</h2>
//         <app-date-picker 
//           [config]="singleConfig" 
//           (dateSelect)="handleSingleSelect($event)">
//         </app-date-picker>
//       </div>

//       <div class="w-full max-w-md">
//          <h2 class="text-xl font-bold mb-4">Range Selection</h2>
//          <app-date-picker 
//            [config]="rangeConfig" 
//            (dateSelect)="handleRangeSelect($event)">
//          </app-date-picker>
//       </div>

//       <div class="bg-white p-4 rounded shadow mt-4 w-full max-w-md">
//         <p><strong>Selected Range:</strong> {{ result | json }}</p>
//       </div>

//     </div>
//   `
// })
// export class AppComponent {
  
//   singleConfig: DatePickerConfig = {
//     type: 'single',
//     label: 'Appointment Date',
//     placeholder: 'Pick a day'
//   };

//   rangeConfig: DatePickerConfig = {
//     type: 'both',
//     label: 'Vacation Period',
//     placeholder: 'Start Date - End Date'
//   };

//   result: any;

//   handleSingleSelect(data: DateRangeEmit) {
//     console.log('Single Date:', data.from);
//     this.result = data;
//   }

//   handleRangeSelect(data: DateRangeEmit) {
//     console.log('From:', data.from, 'To:', data.to);
//     this.result = data;
//   }
// }