import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Edit, Trash, X, Save, AlertCircle, Activity, Key, Shield,
  ChevronDown, Package, CheckCircle, Zap, Ban, ShieldAlert, RefreshCw,
  Usb
} from 'lucide-angular';
import { ModalService } from '../modal/modalService';
import { ToastService } from '../toast/toastService';
import { IntegrationsService } from './integrations.service';
import {
  IntegrationDto, IntegrationRequest, IntegrationType,
  RazorpayRequest, EmailRequest, GmailRequest
} from './integrations.model';

// Catalog definition
interface CatalogItem {
  type: IntegrationType;
  testType?: IntegrationType;
  initials: string;
  label: string;
  desc: string;
  color: 'blue' | 'green' | 'purple' | 'amber' | 'gray';
}

interface MergedCard extends CatalogItem {
  configured?: IntegrationDto;
}

const CATALOG: CatalogItem[] = [
  {
    type: IntegrationType.RAZORPAY, testType: IntegrationType.RAZORPAY_TEST,
    initials: 'RP', label: 'Razorpay', color: 'blue',
    desc: 'Payment gateway for invoices & subscriptions'
  },
  {
    type: IntegrationType.STRIPE, testType: IntegrationType.STRIPE_TEST,
    initials: 'ST', label: 'Stripe', color: 'purple',
    desc: 'Global payment processing & billing'
  },
  {
    type: IntegrationType.WHATSAPP,
    initials: 'WA', label: 'WhatsApp Business', color: 'green',
    desc: 'Order & delivery alerts via WhatsApp'
  },
  {
    type: IntegrationType.GMAIL, testType: IntegrationType.GMAIL_TEST,
    initials: 'GM', label: 'Gmail', color: 'gray',
    desc: 'Gmail SMTP for outbound mail'
  }
];


@Component({
  selector: 'app-integrations',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './integrations.component.html',
  styleUrl: './integrations.component.css'
})
export class IntegrationsComponent implements OnInit {

  @ViewChild('integrationFormModal') integrationFormModal!: TemplateRef<any>;

  // Icons
  readonly EditIcon = Edit;
  readonly TrashIcon = Trash;
  readonly XIcon = X;
  readonly SaveIcon = Save;
  readonly AlertCircleIcon = AlertCircle;
  readonly ActivityIcon = Activity;
  readonly KeyIcon = Key;
  readonly ShieldIcon = Shield;
  readonly ChevronDownIcon = ChevronDown;
  readonly PackageIcon = Package;
  readonly CheckCircleIcon = CheckCircle;
  readonly ZapIcon = Zap;
  readonly BanIcon = Ban;
  readonly ShieldAlertIcon = ShieldAlert;
  readonly RefreshCwIcon = RefreshCw;
  readonly UsbIcon = Usb;

  // UI state
  isExpanded = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);
  testingId = signal<number | null>(null);
  editingId = signal<number | null>(null);
  deletingId = signal<number | null>(null);

  // Data
  integrations = signal<IntegrationDto[]>([]);
  integrationRequest = new IntegrationRequest();

  // Type-specific config objects (populated when modal opens)
  razorpayConfig: RazorpayRequest = this.freshRazorpay();
  emailConfig: EmailRequest = this.freshEmail();
  gmailConfig: GmailRequest = this.freshGmail();

  // Expose enum to template
  readonly IntegrationType = IntegrationType;

  constructor(
    private toast: ToastService,
    private modalSvs: ModalService,
    private integrationsSvs: IntegrationsService
  ) { }

  ngOnInit(): void {
    this.loadIntegrations();
  }

  // Data
  loadIntegrations(): void {
    this.isLoading.set(true);
    this.integrationsSvs.getIntegrations(
      (res: any) => {
        this.integrations.set(res.data || []);
        this.isLoading.set(false);
      },
      (err: any) => {
        this.toast.show(err?.error?.message || 'Failed to load integrations', 'error');
        this.isLoading.set(false);
      }
    );
  }

  // Catalog cards
  get catalogCards(): MergedCard[] {
    const loaded = this.integrations();
    return CATALOG.map(item => ({
      ...item,
      configured: loaded.find(i =>
        i.integrationType === item.type || i.integrationType === item.testType
      )
    }));
  }

  // Modal open
  openConnectModal(card: MergedCard): void {
    this.editingId.set(null);
    this.integrationRequest = new IntegrationRequest();
    this.integrationRequest.integrationType = card.type;
    this.razorpayConfig = this.freshRazorpay(card.type as any);
    this.emailConfig = this.freshEmail(card.type as any);
    this.gmailConfig = this.freshGmail();
    this.modalSvs.openTemplate(this.integrationFormModal, null, 'md');
  }

  openEditModal(item: IntegrationDto): void {
    this.editingId.set(item.id);
    this.integrationRequest = {
      integrationType: item.integrationType,
      displayName: item.displayName,
      primaryKey: item.primaryKey,
      secondaryKey: item.secondaryKey,
      tertiaryKey: item.tertiaryKey,
      isTestMode: item.isTestMode,
      webhookConfig: item.webhookConfig,
      extraConfig: item.extraConfig,
      links: item.links
    };
    // Hydrate type-specific config from stored extraConfig
    if (this.isRazorpayType()) {
      try {
        this.razorpayConfig = { ...this.freshRazorpay(item.integrationType as any), ...JSON.parse(item.extraConfig || '{}') };
      } catch {
        this.razorpayConfig = this.freshRazorpay(item.integrationType as any);
      }
    } else if (this.isEmailSmtpType()) {
      try {
        this.emailConfig = { ...this.freshEmail(item.integrationType as any), ...JSON.parse(item.extraConfig || '{}') };
      } catch {
        this.emailConfig = this.freshEmail(item.integrationType as any);
      }
    } else if (this.isGmailType()) {
      try {
        this.gmailConfig = { ...this.freshGmail(), ...JSON.parse(item.extraConfig || '{}') };
      } catch {
        this.gmailConfig = this.freshGmail();
      }
    }
    this.modalSvs.openTemplate(this.integrationFormModal, null, 'md');
  }

  closeModal(): void {
    this.modalSvs.close();
    this.editingId.set(null);
    this.integrationRequest = new IntegrationRequest();
  }

  // CRUD
  saveIntegration(): void {
    if (this.isRazorpayType()) {
      if (!this.razorpayConfig.keyId?.trim()) {
        this.toast.show('Key ID is required', 'error');
        return;
      }
      // Map Razorpay fields → generic request + extraConfig
      this.integrationRequest.primaryKey = this.razorpayConfig.keyId;
      this.integrationRequest.secondaryKey = this.razorpayConfig.keySecret;
      this.integrationRequest.webhookConfig = this.razorpayConfig.webhookSecret;
      this.integrationRequest.isTestMode = this.integrationRequest.integrationType === IntegrationType.RAZORPAY_TEST;
      this.integrationRequest.extraConfig = JSON.stringify(this.razorpayConfig);

    } else if (this.isEmailSmtpType()) {
      if (!this.emailConfig.smtpUsername?.trim()) {
        this.toast.show('SMTP username is required', 'error');
        return;
      }
      // Map Email fields → generic request + extraConfig
      this.integrationRequest.primaryKey = this.emailConfig.smtpUsername;
      this.integrationRequest.secondaryKey = this.emailConfig.smtpPassword;
      this.integrationRequest.isTestMode = this.integrationRequest.integrationType === IntegrationType.EMAIL_SMTP_TEST;
      this.integrationRequest.extraConfig = JSON.stringify(this.emailConfig);

    } else if (this.isGmailType()) {
      if (!this.gmailConfig.smtpUsername?.trim()) {
        this.toast.show('Gmail username is required', 'error');
        return;
      }
      this.integrationRequest.primaryKey = this.gmailConfig.smtpUsername;
      this.integrationRequest.secondaryKey = this.gmailConfig.smtpPassword;
      this.integrationRequest.isTestMode = this.integrationRequest.integrationType === IntegrationType.GMAIL_TEST;
      this.integrationRequest.extraConfig = JSON.stringify(this.gmailConfig);

    } else {
      if (!this.integrationRequest.primaryKey?.trim()) {
        this.toast.show('Primary key is required', 'error');
        return;
      }
    }

    this.isSaving.set(true);
    const id = this.editingId();

    const onSuccess = (msg: string) => (_res: any) => {
      this.toast.show(msg, 'success');
      this.isSaving.set(false);
      this.closeModal();
      this.loadIntegrations();
    };

    const onError = (err: any) => {
      this.toast.show(err?.error?.message || 'Something went wrong', 'error');
      this.isSaving.set(false);
    };

    if (id) {
      this.integrationsSvs.updateIntegration(id, this.integrationRequest, onSuccess('Integration updated'), onError);
    } else {
      this.integrationsSvs.createIntegration(this.integrationRequest, onSuccess('Integration connected'), onError);
    }
  }

  confirmDelete(id: number): void {
    this.deletingId.set(id);
  }

  cancelDelete(): void {
    this.deletingId.set(null);
  }

  executeDelete(id: number): void {
    this.integrationsSvs.deleteIntegration(
      id,
      (_res: any) => {
        this.toast.show('Integration removed', 'success');
        this.deletingId.set(null);
        this.loadIntegrations();
      },
      (err: any) => {
        this.toast.show(err?.error?.message || 'Failed to remove', 'error');
        this.deletingId.set(null);
      }
    );
  }

  toggleIntegration(item: IntegrationDto): void {
    this.integrationsSvs.toggleIntegration(
      item.id,
      (_res: any) => {
        this.toast.show(`Integration ${item.isActive ? 'disabled' : 'enabled'}`, 'success');
        this.loadIntegrations();
      },
      (err: any) => {
        this.toast.show(err?.error?.message || 'Failed to toggle', 'error');
      }
    );
  }

  testCardConnection(id: number): void {
    this.testingId.set(id);
    this.integrationsSvs.testConnection(
      id,
      (_res: any) => {
        this.toast.show('Connection successful!', 'success');
        this.testingId.set(null);
      },
      (err: any) => {
        this.toast.show(err?.error?.message || 'Connection test failed', 'error');
        this.testingId.set(null);
      }
    );
  }

  testModalConnection(): void {
    const id = this.editingId();
    if (!id) {
      this.toast.show('Save the integration first to test the connection', 'info');
      return;
    }
    this.testCardConnection(id);
  }

  // Razorpay test-mode toggle (inside modal)

  toggleRazorpayMode(): void {
    const current = this.integrationRequest.integrationType;
    const next = current === IntegrationType.RAZORPAY
      ? IntegrationType.RAZORPAY_TEST
      : IntegrationType.RAZORPAY;
    this.integrationRequest.integrationType = next;
    this.razorpayConfig.type = next as any;
  }

  toggleEmailSmtpMode(): void {
    const current = this.integrationRequest.integrationType;
    const next = current === IntegrationType.EMAIL_SMTP
      ? IntegrationType.EMAIL_SMTP_TEST
      : IntegrationType.EMAIL_SMTP;
    this.integrationRequest.integrationType = next;
    this.emailConfig.type = next as any;
  }

  toggleGmailMode(): void {
    const current = this.integrationRequest.integrationType;
    const next = current === IntegrationType.GMAIL
      ? IntegrationType.GMAIL_TEST
      : IntegrationType.GMAIL;
    this.integrationRequest.integrationType = next;
    this.gmailConfig.type = next as any;
  }

  // Type detection
  isRazorpayType(): boolean {
    const t = this.integrationRequest.integrationType;
    return t === IntegrationType.RAZORPAY || t === IntegrationType.RAZORPAY_TEST;
  }

  isEmailSmtpType(): boolean {
    const t = this.integrationRequest.integrationType;
    return t === IntegrationType.EMAIL_SMTP || t === IntegrationType.EMAIL_SMTP_TEST;
  }

  isGmailType(): boolean {
    const t = this.integrationRequest.integrationType;
    return t === IntegrationType.GMAIL || t === IntegrationType.GMAIL_TEST;
  }

  isCardTesting(id: number): boolean {
    return this.testingId() === id;
  }

  isModalTesting(): boolean {
    const id = this.editingId();
    return id !== null && this.testingId() === id;
  }

  // Visual helpers
  getBadgeClasses(color: string): string[] {
    const map: Record<string, string[]> = {
      blue: ['bg-blue-100', 'text-blue-700'],
      green: ['bg-green-100', 'text-green-700'],
      purple: ['bg-purple-100', 'text-purple-700'],
      amber: ['bg-amber-100', 'text-amber-700'],
      gray: ['bg-gray-100', 'text-gray-600'],
    };
    return map[color] ?? map['gray'];
  }

  // Private factories

  private freshRazorpay(type: 'RAZORPAY' | 'RAZORPAY_TEST' = 'RAZORPAY'): RazorpayRequest {
    return { keyId: '', keySecret: '', webhookSecret: '', currency: 'INR', type };
  }

  private freshEmail(type: 'EMAIL_SMTP' | 'EMAIL_SMTP_TEST' = 'EMAIL_SMTP'): EmailRequest {
    return {
      smtpUsername: '', smtpPassword: '', type
    };
  }

  private freshGmail(): GmailRequest {
    return {
      smtpUsername: '', smtpPassword: '', type: 'GMAIL'
    };
  }
}
