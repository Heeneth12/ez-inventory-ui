import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Phone, Mail, BadgeCheck, ExternalLink, X, FileText, MapPin, Loader2, User } from 'lucide-angular';
import { ContactModel } from '../../../views/contacts/contacts.model';
import { Router } from '@angular/router';

export interface UserCardData {
  id: string | number;
  name: string;
  userType: string;
  userUuid: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
  isVerified?: boolean;
}
@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.css'
})
export class UserCardComponent {
  @Input({ required: true }) data!: UserCardData;
  @Output() viewProfile = new EventEmitter<string | number>();

  isOpen = false;
  isLoading = false;
  contactDetails: ContactModel | null = null;

  // Icon References
  User = User
  PhoneIcon = Phone;
  MailIcon = Mail;
  BadgeIcon = BadgeCheck;
  LinkIcon = ExternalLink;
  CloseIcon = X;
  FileIcon = FileText;
  MapIcon = MapPin;

  constructor(
    private router: Router,
    private elementRef: ElementRef
  ) { 
    console.log('UserCardComponent initialized with data:', this.data);
  }

  // Getter helper to quickly find the first address
  get primaryAddress() {
    return this.contactDetails?.addresses?.[0];
  }

  toggleDropdown(event: MouseEvent) {
    event.stopPropagation(); // Stop click from hitting document

    if (this.isOpen) {
      this.closeDropdown();
    } else {
      this.isOpen = true;
    }
  }

  closeDropdown() {
    this.isOpen = false;
    // Optional: Reset data if you want fresh data every time
    // this.contactDetails = null; 
  }

  onViewFullProfile() {
    this.router.navigate(['admin/user/profile', this.data.id])
    this.closeDropdown();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }
}