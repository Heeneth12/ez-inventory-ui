import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// --- Types ---
type EventType = 'restock' | 'maintenance' | 'audit' | 'meeting';
type Priority = 'low' | 'medium' | 'high';

interface CalendarEvent {
  id: number;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: EventType;
  priority: Priority;
  description?: string;
  location?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-[1600px] mx-auto min-h-screen text-slate-800 flex flex-col h-screen overflow-hidden">
      
      <!-- HEADER SECTION -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <svg [innerHTML]="getIcon(icons.calendar)" class="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></svg>
            Operations Schedule
          </h1>
          <p class="text-slate-500 text-sm">Manage shipments, maintenance, and fleet availability.</p>
        </div>

        <div class="flex items-center gap-3 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          <button (click)="changeMonth(-1)" class="p-2 hover:bg-slate-100 rounded-md transition-colors text-slate-600">
            <svg [innerHTML]="getIcon(icons.chevronLeft)" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></svg>
          </button>
          <span class="text-lg font-bold min-w-[140px] text-center select-none">
            {{ currentMonthName }} {{ currentYear }}
          </span>
          <button (click)="changeMonth(1)" class="p-2 hover:bg-slate-100 rounded-md transition-colors text-slate-600">
            <svg [innerHTML]="getIcon(icons.chevronRight)" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></svg>
          </button>
          <div class="w-px h-6 bg-slate-200 mx-1"></div>
          <button (click)="goToToday()" class="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
            Today
          </button>
        </div>

        <button (click)="openAddModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-md transition-colors font-medium">
          <svg [innerHTML]="getIcon(icons.plus)" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></svg>
          Add Event
        </button>
      </div>

      <!-- MAIN CONTENT SPLIT -->
      <div class="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        <!-- LEFT: Filters & Agenda (Fixed width) -->
        <div class="lg:w-80 flex flex-col gap-6 shrink-0 overflow-y-auto pr-2">
          
          <!-- Category Filters -->
          <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg [innerHTML]="getIcon(icons.filter)" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></svg> 
              Filters
            </h3>
            <div class="space-y-2">
              <label *ngFor="let type of eventTypes" class="flex items-center gap-3 cursor-pointer group p-2 hover:bg-slate-50 rounded-lg transition-colors">
                <input type="checkbox" [(ngModel)]="filters[type.value]" (change)="refreshCalendar()"
                  class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                <div [class]="'p-1.5 rounded-md ' + type.bg + ' ' + type.color">
                  <svg [innerHTML]="getIcon(type.icon)" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></svg>
                </div>
                <span class="text-sm font-medium text-slate-700">{{ type.label }}</span>
              </label>
            </div>
          </div>

          <!-- Upcoming/Selected Day Agenda -->
          <div class="bg-white rounded-xl border border-slate-200 flex-1 shadow-sm flex flex-col min-h-0">
            <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
              <h3 class="font-bold text-slate-800">
                {{ selectedDate ? (selectedDate | date:'mediumDate') : 'Upcoming' }}
              </h3>
              <span class="text-xs font-medium px-2 py-1 bg-white border border-slate-200 rounded-full text-slate-500">
                {{ getSelectedDateEvents().length }} Events
              </span>
            </div>
            
            <div class="p-4 space-y-3 overflow-y-auto flex-1">
              <div *ngIf="getSelectedDateEvents().length === 0" class="text-center py-8 text-slate-400">
                <svg [innerHTML]="getIcon(icons.calendar)" class="w-10 h-10 mx-auto mb-2 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></svg>
                <p class="text-sm">No events scheduled.</p>
                <button (click)="openAddModal(selectedDate)" class="mt-2 text-xs text-blue-600 font-medium hover:underline">Schedule something?</button>
              </div>

              <div *ngFor="let event of getSelectedDateEvents()" 
                   class="group relative bg-white border border-slate-100 rounded-lg p-3 hover:shadow-md transition-all hover:border-blue-200 cursor-pointer">
                <!-- Priority Stripe -->
                <div [class]="'absolute left-0 top-3 bottom-3 w-1 rounded-r-full ' + getPriorityColor(event.priority)"></div>
                
                <div class="pl-3">
                  <div class="flex justify-between items-start mb-1">
                    <span [class]="'text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ' + getTypeStyle(event.type).badge">
                      {{ event.type }}
                    </span>
                    <button class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity">
                      <svg [innerHTML]="getIcon(icons.more)" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></svg>
                    </button>
                  </div>
                  <h4 class="font-semibold text-slate-800 text-sm mb-1">{{ event.title }}</h4>
                  <div class="flex items-center gap-3 text-xs text-slate-500">
                    <span class="flex items-center gap-1">
                      <svg [innerHTML]="getIcon(icons.clock)" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></svg>
                      {{ event.startTime }} - {{ event.endTime }}
                    </span>
                    <span *ngIf="event.location" class="flex items-center gap-1 truncate max-w-[80px]">
                      <svg [innerHTML]="getIcon(icons.pin)" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></svg>
                      {{ event.location }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT: Calendar Grid -->
        <div class="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <!-- Weekday Headers -->
          <div class="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
            <div *ngFor="let day of weekDays" class="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {{ day }}
            </div>
          </div>

          <!-- Days Grid -->
          <div class="grid grid-cols-7 flex-1 auto-rows-fr overflow-y-auto">
            <div *ngFor="let day of calendarDays" 
                 (click)="selectDate(day.date)"
                 [class]="'min-h-[120px] border-b border-r border-slate-100 p-2 transition-colors relative group ' + 
                          (day.isCurrentMonth ? 'bg-white' : 'bg-slate-50/50') + 
                          (isSameDate(day.date, selectedDate) ? ' ring-2 ring-inset ring-blue-500 bg-blue-50/10' : ' hover:bg-slate-50')">
              
              <!-- Date Number -->
              <div class="flex justify-between items-start mb-2">
                <span [class]="'w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium transition-colors ' + 
                              (day.isToday ? 'bg-blue-600 text-white shadow-sm' : 
                               day.isCurrentMonth ? 'text-slate-700' : 'text-slate-400')">
                  {{ day.date.getDate() }}
                </span>
                
                <!-- Hover Add Button -->
                <button (click)="openAddModal(day.date); $event.stopPropagation()" 
                  class="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-100 text-blue-600 rounded-md transition-all scale-90 hover:scale-100">
                  <svg [innerHTML]="getIcon(icons.plus)" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></svg>
                </button>
              </div>

              <!-- Events in Grid -->
              <div class="space-y-1">
                <div *ngFor="let event of day.events | slice:0:3" 
                     class="text-[10px] px-1.5 py-1 rounded border truncate font-medium flex items-center gap-1 shadow-sm transition-transform hover:-translate-y-0.5 cursor-pointer"
                     [ngClass]="getTypeStyle(event.type).card">
                    <div [class]="'w-1.5 h-1.5 rounded-full shrink-0 ' + getTypeStyle(event.type).dot"></div>
                    <span class="truncate">{{ event.title }}</span>
                </div>
                
                <div *ngIf="day.events.length > 3" class="text-[10px] text-slate-400 font-medium pl-1 hover:text-blue-600 cursor-pointer">
                  +{{ day.events.length - 3 }} more
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ADD EVENT MODAL OVERLAY -->
    <div *ngIf="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" (click)="closeModal()"></div>
      
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 class="font-bold text-lg text-slate-800">New Schedule Entry</h3>
          <button (click)="closeModal()" class="text-slate-400 hover:text-slate-600 transition-colors">
            <svg [innerHTML]="getIcon(icons.x)" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
            <input type="text" [(ngModel)]="newEvent.title" placeholder="e.g. Monthly Stock Count" 
                   class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select [(ngModel)]="newEvent.type" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                <option value="restock">Restock</option>
                <option value="maintenance">Maintenance</option>
                <option value="audit">Audit</option>
                <option value="meeting">Meeting</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select [(ngModel)]="newEvent.priority" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input type="date" [ngModel]="formatDateForInput(newEvent.date)" (ngModelChange)="updateNewEventDate($event)"
                     class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
            </div>
            <div class="flex gap-2">
               <div class="flex-1">
                 <label class="block text-sm font-medium text-slate-700 mb-1">Start</label>
                 <input type="time" [(ngModel)]="newEvent.startTime" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
               </div>
               <div class="flex-1">
                 <label class="block text-sm font-medium text-slate-700 mb-1">End</label>
                 <input type="time" [(ngModel)]="newEvent.endTime" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
               </div>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Location / Notes</label>
            <textarea [(ngModel)]="newEvent.location" rows="2" placeholder="Warehouse Section B..." 
                   class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm resize-none"></textarea>
          </div>

          <div class="flex items-center gap-2 pt-2">
             <input type="checkbox" id="reminder" class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
             <label for="reminder" class="text-sm text-slate-600 flex items-center gap-1.5 select-none cursor-pointer">
                <svg [innerHTML]="getIcon(icons.bell)" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></svg>
                Remind me 30 minutes before
             </label>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
          <button (click)="closeModal()" class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
          <button (click)="saveEvent()" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors">Save Event</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 20px; }
  `]
})
export class CalendarComponent implements OnInit {
  
  // Icons stored as SVG path strings
  readonly icons = {
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
    chevronLeft: '<polyline points="15 18 9 12 15 6"></polyline>',
    chevronRight: '<polyline points="9 18 15 12 9 6"></polyline>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>',
    clock: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
    pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>',
    filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>',
    more: '<circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle>',
    truck: '<rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>',
    check: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="m9 14 2 2 4-4"></path>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
    x: '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>'
  };

  // State
  currentDate = new Date();
  selectedDate: Date  = new Date();
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDays: CalendarDay[] = [];
  
  // Event Types configuration
  eventTypes = [
    { label: 'Restock', value: 'restock', icon: this.icons.truck, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Maintenance', value: 'maintenance', icon: this.icons.wrench, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Audit', value: 'audit', icon: this.icons.check, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Meeting', value: 'meeting', icon: this.icons.users, color: 'text-purple-600', bg: 'bg-purple-50' }
  ];

  filters: any = {
    restock: true,
    maintenance: true,
    audit: true,
    meeting: true
  };

  allEvents: CalendarEvent[] = [
    { id: 1, title: 'Quarterly Inventory Audit', date: new Date(new Date().getFullYear(), new Date().getMonth(), 15), startTime: '09:00', endTime: '16:00', type: 'audit', priority: 'high', location: 'Main Warehouse' },
    { id: 2, title: 'Brake Pads Delivery', date: new Date(new Date().getFullYear(), new Date().getMonth(), 12), startTime: '10:30', endTime: '11:00', type: 'restock', priority: 'medium', location: 'Dock 4' },
    { id: 3, title: 'Forklift Service', date: new Date(new Date().getFullYear(), new Date().getMonth(), 5), startTime: '14:00', endTime: '15:30', type: 'maintenance', priority: 'high', location: 'Garage B' },
    { id: 4, title: 'Staff Safety Briefing', date: new Date(new Date().getFullYear(), new Date().getMonth(), 22), startTime: '08:00', endTime: '09:00', type: 'meeting', priority: 'low', location: 'Conf Room 1' },
    { id: 5, title: 'Oil Filter Restock', date: new Date(new Date().getFullYear(), new Date().getMonth(), 12), startTime: '13:00', endTime: '13:30', type: 'restock', priority: 'low', location: 'Dock 1' },
  ];

  // Modal State
  showModal = false;
  newEvent: CalendarEvent = this.getEmptyEvent();

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.generateCalendar();
  }

  getIcon(svgContent: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svgContent);
  }

  get currentMonthName(): string {
    return this.currentDate.toLocaleString('default', { month: 'long' });
  }

  get currentYear(): number {
    return this.currentDate.getFullYear();
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    // First day of the month
    const firstDayOfMonth = new Date(year, month, 1);
    // Last day of the month
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Day index (0-6) of the first day
    const startDayIndex = firstDayOfMonth.getDay();
    
    // Last day of previous month
    const lastDayPrevMonth = new Date(year, month, 0).getDate();

    const days: CalendarDay[] = [];

    // Previous month padding
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, lastDayPrevMonth - i);
      days.push({
        date: date,
        isCurrentMonth: false,
        isToday: this.isToday(date),
        events: this.getEventsForDate(date)
      });
    }

    // Current month days
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({
        date: date,
        isCurrentMonth: true,
        isToday: this.isToday(date),
        events: this.getEventsForDate(date)
      });
    }

    // Next month padding to fill grid (42 cells standard)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date: date,
        isCurrentMonth: false,
        isToday: this.isToday(date),
        events: this.getEventsForDate(date)
      });
    }

    this.calendarDays = days;
  }

  // --- Helpers ---

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  isSameDate(d1: Date, d2: Date | null): boolean {
    if (!d2) return false;
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  }

  getEventsForDate(date: Date): CalendarEvent[] {
    return this.allEvents.filter(e => 
      this.isSameDate(e.date, date) && this.filters[e.type]
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  // --- Actions ---

  changeMonth(delta: number) {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + delta, 1);
    this.generateCalendar();
  }

  goToToday() {
    this.currentDate = new Date();
    this.selectedDate = new Date();
    this.generateCalendar();
  }

  selectDate(date: Date) {
    this.selectedDate = date;
  }

  refreshCalendar() {
    this.generateCalendar();
  }

  getSelectedDateEvents(): CalendarEvent[] {
    if (!this.selectedDate) return [];
    return this.getEventsForDate(this.selectedDate);
  }

  // --- Styling Helpers ---

  getTypeStyle(type: EventType) {
    switch (type) {
      case 'restock': return { card: 'bg-blue-50 border-blue-200 text-blue-700', badge: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' };
      case 'maintenance': return { card: 'bg-orange-50 border-orange-200 text-orange-700', badge: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500' };
      case 'audit': return { card: 'bg-rose-50 border-rose-200 text-rose-700', badge: 'bg-rose-100 text-rose-800', dot: 'bg-rose-500' };
      case 'meeting': return { card: 'bg-purple-50 border-purple-200 text-purple-700', badge: 'bg-purple-100 text-purple-800', dot: 'bg-purple-500' };
      default: return { card: 'bg-gray-50 border-gray-200 text-gray-700', badge: 'bg-gray-100 text-gray-800', dot: 'bg-gray-500' };
    }
  }

  getPriorityColor(priority: Priority): string {
    switch(priority) {
      case 'high': return 'bg-rose-500';
      case 'medium': return 'bg-orange-400';
      case 'low': return 'bg-blue-400';
    }
  }

  // --- Modal Logic ---

  getEmptyEvent(): CalendarEvent {
    return {
      id: 0,
      title: '',
      date: new Date(),
      startTime: '09:00',
      endTime: '10:00',
      type: 'meeting',
      priority: 'medium',
      location: ''
    };
  }

  openAddModal(date?: Date) {
    this.newEvent = this.getEmptyEvent();
    if (date) {
      this.newEvent.date = date;
    } else if (this.selectedDate) {
      this.newEvent.date = this.selectedDate;
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveEvent() {
    if(!this.newEvent.title) return; // Simple validation
    
    const eventToSave = { ...this.newEvent, id: Date.now() }; // Clone
    this.allEvents.push(eventToSave);
    this.refreshCalendar();
    this.closeModal();
  }

  // Date input handling
  formatDateForInput(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  updateNewEventDate(dateString: string) {
    const parts = dateString.split('-');
    this.newEvent.date = new Date(+parts[0], +parts[1] - 1, +parts[2]);
  }
}