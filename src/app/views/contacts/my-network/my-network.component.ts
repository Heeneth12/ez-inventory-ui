import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Building2, Mail, Phone, MapPin, Zap, ChevronDown, UserPlus, CheckCircle2, XCircle, Clock } from 'lucide-angular';
import { DrawerService } from '../../../layouts/components/drawer/drawerService';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { TenantModel } from '../../user-management/models/tenant.model';
import { UserManagementService } from '../../user-management/userManagement.service';
import { ContactService } from '../contacts.service';

@Component({
  selector: 'app-my-network',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './my-network.component.html',
  styleUrls: ['./my-network.component.css']
})
export class MyNetworkComponent implements OnInit {

  @ViewChild('findTenantTemplate') findTenantTemplate!: TemplateRef<any>;

  networkConnections: any[] = [];
  incomingRequests: any[] = [];
  tenants: TenantModel[] = [];
  filteredTenants: TenantModel[] = [];

  activeTab: 'CONNECTIONS' | 'INVITES' = 'CONNECTIONS';
  selectedTenantId: number | null = null;
  searchQuery: string = '';

  readonly Search = Search;
  readonly Building2 = Building2;
  readonly Mail = Mail;
  readonly Phone = Phone;
  readonly MapPin = MapPin;
  readonly Zap = Zap;
  readonly ChevronDown = ChevronDown;
  readonly UserPlus = UserPlus;
  readonly CheckCircle2 = CheckCircle2;
  readonly XCircle = XCircle;
  readonly Clock = Clock;

  constructor(
    private contactService: ContactService,
    private userManagementService: UserManagementService,
    public drawerService: DrawerService,
    private toast: ToastService
  ) { }

  ngOnInit() {
    this.loadMyNetwork();
    this.loadIncomingRequests();
  }


  loadMyNetwork() {
    this.contactService.getMyNetwork(
      (res: any) => this.networkConnections = res.data,
      (err: any) => this.toast.show('Failed to load connections', 'error')
    );
  }

  loadIncomingRequests() {
    this.contactService.getIncomingRequests(
      (res: any) => this.incomingRequests = res.data,
      (err: any) => this.toast.show('Failed to load invitations', 'error')
    );
  }

  loadGlobalTenants() {
    this.userManagementService.getAllTenants(0, 100, {},
      (res: any) => {
        this.tenants = res.data.content;
        this.filteredTenants = [...this.tenants];
        this.drawerService.openTemplate(
          this.findTenantTemplate, 'Find Business Partners'
          , 'lg');
      },
      (err: any) => {

      }
    );
  }

  // --- Actions ---

  sendTradeRequest(targetTenant: TenantModel) {
    const payload = {
      receiverTenantId: targetTenant.id,
      message: `Request to establish B2B trade link with ${targetTenant.tenantName}`,
      senderBusinessName: 'Your Company Name' // You can pull this from your UserContext/Auth state
    };

    this.contactService.sendNetworkRequest(payload,
      (res: any) => {
        this.toast.show('Invitation sent successfully!', 'success');
        this.drawerService.close();
        // Optionally refresh if you show "Sent" status in UI
      },
      (err: any) => {
        this.toast.show(err.error?.message || 'Failed to send request', 'error');
      }
    );
  }

  handleRequest(requestId: number, status: 'CONNECTED' | 'REJECTED') {
    this.contactService.updateNetworkStatus(requestId, status,
      (res: any) => {
        this.toast.show(`Request ${status === 'CONNECTED' ? 'accepted' : 'rejected'}`, 'success');
        this.loadMyNetwork(); // Refresh connection list
        this.loadIncomingRequests(); // Refresh invite list
      },
      (err: any) => {
        this.toast.show('Action failed', 'error');
      }
    );
  }
  // --- UI Logic ---

  filterTenants(event: any) {
    const val = event.target.value.toLowerCase();
    this.filteredTenants = this.tenants.filter(t =>
      t.tenantName.toLowerCase().includes(val) || t.tenantCode.toLowerCase().includes(val)
    );
  }

  toggleTenant(id: number) {
    this.selectedTenantId = this.selectedTenantId === id ? null : id;
  }
}