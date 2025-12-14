import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Phone, Mail, BadgeCheck, ExternalLink, X, FileText, MapPin, Loader2, User } from 'lucide-angular';
import { ContactService } from '../../../views/contacts/contacts.service';
import { ContactModel } from '../../../views/contacts/contacts.model';
import { Router } from '@angular/router';

export interface UserCardData {
  id: string | number;
  name: string;
  avatarUrl?: string;
  role?: string;
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
    private contactService: ContactService,
     private router: Router,
    private elementRef: ElementRef
  ) { }

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
      this.fetchData();
    }
  }

  closeDropdown() {
    this.isOpen = false;
    // Optional: Reset data if you want fresh data every time
    // this.contactDetails = null; 
  }

  fetchData() {
    // Prevent refetching if we already have data (Optional optimization)
    if (this.contactDetails) return;

    this.isLoading = true;
    this.contactService.getContactById(
      this.data.id,
      (response: any) => {
        this.isLoading = false;
        // Assuming response structure matches { data: ContactModel }
        this.contactDetails = response.data ? response.data : response;
      },
      (error: any) => {
        this.isLoading = false;
        console.error('Error fetching contact:', error);
      }
    );
  }

  onViewFullProfile() {
    //this.viewProfile.emit(this.data.id);
    this.router.navigate(['/contacts/profile', this.data.id])
    this.closeDropdown();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }
}