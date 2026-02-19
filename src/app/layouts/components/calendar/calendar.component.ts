import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
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