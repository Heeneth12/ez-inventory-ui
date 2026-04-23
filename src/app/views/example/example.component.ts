import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { StatusStepperComponent } from "../../layouts/UI/status-stepper/status-stepper.component";
import { HttpClient } from '@angular/common/http';
import { UserCardData, UserCardComponent } from '../../layouts/UI/user-card/user-card.component';
import { DatePickerConfig, DateRangeEmit, DatePickerComponent } from '../../layouts/UI/date-picker/date-picker.component';
import { FileManagerComponent } from '../file-manager/file-manager.component';
import { FileManagerService } from '../file-manager/file-manager.service';


import {
  LucideAngularModule,
  Edit, X, Save, Bell, Shield, Clock, Monitor, Smartphone,
  LogOut, CheckCircle, AlertCircle, Upload, FileText, Info,
  Download, Trash, Eye, Activity, Database, BarChart2
} from 'lucide-angular';
import { FeedbackComponent } from "../../layouts/components/feedback/feedback.component";

// ── Interfaces ────────────────────────────────────────────────
export interface NotificationRow {
  label: string;
  desc: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface DocumentRecord {
  label: string;
  hint: string;
  status: 'verified' | 'pending' | 'rejected' | 'not_uploaded';
  fileName?: string;
}

export interface SessionRecord {
  device: string;
  location: string;
  lastActive: string;
  type: 'desktop' | 'mobile';
  isCurrent: boolean;
  id: string;
}

export interface PrivacyPref {
  label: string;
  desc: string;
  enabled: boolean;
  color: 'blue' | 'green' | 'purple' | 'amber';
  icon: any;
}

export interface Integration {
  name: string;
  initials: string;
  desc: string;
  connected: boolean;
  color: 'blue' | 'green' | 'purple' | 'amber' | 'gray';
}

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, StatusStepperComponent, UserCardComponent, DatePickerComponent, FileManagerComponent, LucideAngularModule, FeedbackComponent],
  templateUrl: './example.component.html',
  styleUrl: './example.component.css'
})
export class ExampleComponent {





  orders = [
    { id: 'SHP-5574', statusIndex: 2 }, // Bill done (matches row 1 in your image)
    { id: 'SHP-5575', statusIndex: 4 }, // All done (matches row 3)
    { id: 'SHP-5576', statusIndex: 0 }, // Draft (matches row 4)
  ];


  singleConfig: DatePickerConfig = {
    type: 'single',
    label: 'Appointment Date',
    placeholder: 'Pick a day'
  };

  rangeConfig: DatePickerConfig = {
    type: 'both',
    label: 'Vacation Period',
    placeholder: 'Start Date - End Date'
  };

  result: any;

  handleSingleSelect(data: DateRangeEmit) {
    console.log('Single Date:', data.from);
    this.result = data;
  }

  handleRangeSelect(data: DateRangeEmit) {
    console.log('From:', data.from, 'To:', data.to);
    this.result = data;
  }
  constructor(private fileManagerService: FileManagerService) { }




  //  users: UserCardData[] = [
  //     {
  //       id: 1,
  //       name: 'Talan Dias',
  //       role: 'UX Designer',
  //       isVerified: true
  //     },
  //     {
  //       id: 2,
  //       name: 'Lydia Gouse',
  //       role: 'Product Owner',
  //       isVerified: false
  //     }
  //   ];

  handleProfileApiCall(userId: string | number) {
    console.log('API CALL triggered for user:', userId);
  }


  downloadFile() {
    this.fileManagerService.downloadFile('aab6fa43-bb08-4d7c-a943-30589a9143db', (res: any) => {
      const blob = new Blob([res], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'file.pdf';
      link.click();
      window.URL.revokeObjectURL(url);
      console.log(res);
    },
      (error: any) => {
        console.log(error);
      }
    );
  }



  // ── Lucide icons ──────────────────────────────────────────────
  readonly EditIcon = Edit;
  readonly XIcon = X;
  readonly SaveIcon = Save;
  readonly BellIcon = Bell;
  readonly ShieldIcon = Shield;
  readonly ClockIcon = Clock;
  readonly MonitorIcon = Monitor;
  readonly SmartphoneIcon = Smartphone;
  readonly LogOutIcon = LogOut;
  readonly CheckCircleIcon = CheckCircle;
  readonly AlertCircleIcon = AlertCircle;
  readonly UploadIcon = Upload;
  readonly FileTextIcon = FileText;
  readonly InfoIcon = Info;
  readonly DownloadIcon = Download;
  readonly TrashIcon = Trash;
  readonly EyeIcon = Eye;
  readonly ActivityIcon = Activity;
  readonly DatabaseIcon = Database;
  readonly BarChart2Icon = BarChart2;

  // ── Section 1: Account config ─────────────────────────────────
  isAccountEditMode = false;

  enterAccountEdit() { this.isAccountEditMode = true; }
  cancelAccountEdit() { this.isAccountEditMode = false; }
  saveAccountSettings() {
    // TODO: call API
    this.isAccountEditMode = false;
  }

  // ── Section 2: Notifications ──────────────────────────────────
  notificationRows: NotificationRow[] = [
    { label: 'Low stock alerts', desc: 'When inventory drops below reorder level', email: true, push: true, sms: false },
    { label: 'Purchase orders', desc: 'New PO raised or status changed', email: true, push: true, sms: false },
    { label: 'Goods received', desc: 'Inward delivery confirmed', email: true, push: false, sms: false },
    { label: 'Invoice due', desc: 'Payment due within 3 days', email: true, push: true, sms: true },
    { label: 'Report generated', desc: 'Scheduled reports ready to download', email: true, push: false, sms: false },
    { label: 'Login from new device', desc: 'Security alert for unrecognised sign-in', email: true, push: true, sms: true },
  ];

  toggleNotif(row: NotificationRow, channel: 'email' | 'push' | 'sms') {
    row[channel] = !row[channel];
  }

  saveNotifications() {
    // TODO: call API
  }

  // ── Section 3: Documents ──────────────────────────────────────
  documents: DocumentRecord[] = [
    { label: 'PAN Card', hint: 'Permanent Account Number — required for tax', status: 'verified', fileName: 'pan_arjun.pdf' },
    { label: 'Aadhaar Card', hint: 'Government-issued 12-digit UID', status: 'verified', fileName: 'aadhaar.jpg' },
    { label: 'GST Certificate', hint: 'GSTIN registration document', status: 'pending', fileName: 'gst_cert.pdf' },
    { label: 'Business Licence', hint: 'Shop & Establishment Act certificate', status: 'rejected', fileName: 'biz_licence.pdf' },
    { label: 'Bank Statement', hint: 'Last 3 months — for account verification', status: 'not_uploaded' },
    { label: 'Address Proof', hint: 'Utility bill or lease agreement', status: 'not_uploaded' },
  ];

  uploadDocument(doc: DocumentRecord) {
    // TODO: open file picker and call upload API
    console.log('Upload document:', doc.label);
  }

  // ── Section 4: Security ───────────────────────────────────────
  twoFactorEnabled = false;

  toggleTwoFactor() {
    this.twoFactorEnabled = !this.twoFactorEnabled;
    // TODO: call 2FA enable/disable API
  }

  activeSessions: SessionRecord[] = [
    { id: 'sess_1', device: 'Chrome on Windows 11', location: 'Chennai, IN', lastActive: 'Now', type: 'desktop', isCurrent: true },
    { id: 'sess_2', device: 'Safari on iPhone 15 Pro', location: 'Chennai, IN', lastActive: '2 hours ago', type: 'mobile', isCurrent: false },
    { id: 'sess_3', device: 'Firefox on macOS Sonoma', location: 'Bengaluru, IN', lastActive: '3 days ago', type: 'desktop', isCurrent: false },
  ];

  revokeSession(session: SessionRecord) {
    this.activeSessions = this.activeSessions.filter(s => s.id !== session.id);
    // TODO: call API
  }

  revokeAllSessions() {
    this.activeSessions = this.activeSessions.filter(s => s.isCurrent);
    // TODO: call API
  }

  // ── Section 5: Privacy ────────────────────────────────────────
  privacyPrefs: PrivacyPref[] = [
    { label: 'Activity tracking', desc: 'Allow session activity to improve your experience', enabled: true, color: 'blue', icon: Activity },
    { label: 'Analytics & insights', desc: 'Share anonymised usage data for product analytics', enabled: false, color: 'green', icon: BarChart2 },
    { label: 'Profile visibility', desc: 'Make your name visible to other users in workspace', enabled: true, color: 'purple', icon: Eye },
    { label: 'Data retention', desc: 'Retain deleted records for 30 days for recovery', enabled: true, color: 'amber', icon: Database },
  ];

  togglePrivacy(pref: PrivacyPref) {
    pref.enabled = !pref.enabled;
    // TODO: call API
  }

  exportData() { console.log('Export data'); }
  deactivateAccount() { console.log('Deactivate'); }
  deleteAccount() { console.log('Delete account'); }

  // ── Section 6: Integrations ───────────────────────────────────
  integrations: Integration[] = [
    { name: 'Tally Prime', initials: 'TP', desc: 'Sync ledgers and vouchers', connected: true, color: 'blue' },
    { name: 'WhatsApp Biz', initials: 'WA', desc: 'Send order & delivery alerts', connected: true, color: 'green' },
    { name: 'Razorpay', initials: 'RP', desc: 'Payment gateway for invoices', connected: false, color: 'blue' },
    { name: 'Zoho Books', initials: 'ZB', desc: 'Accounting and expense sync', connected: false, color: 'amber' },
    { name: 'Shiprocket', initials: 'SR', desc: 'Logistics and shipment tracking', connected: true, color: 'purple' },
    { name: 'Google Sheets', initials: 'GS', desc: 'Export reports to Sheets', connected: false, color: 'green' },
  ];

  toggleIntegration(app: Integration) {
    app.connected = !app.connected;
    // TODO: call connect/disconnect API
  }

  ngOnInit() { }

}
