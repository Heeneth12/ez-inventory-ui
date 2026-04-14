import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LucideAngularModule, Crown, Calendar, CheckCircle, XCircle,
  Clock, Users, Zap, Star, ShieldCheck, Plus, Ban, RefreshCw,
  AlertTriangle, Package, X
} from 'lucide-angular';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionModel, SubscriptionPlanModel } from './subscriptions.model';
import { AuthService } from '../../guards/auth.service';
import { ToastService } from '../toast/toastService';
import { ModalService } from '../modal/modalService';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './subscriptions.component.html',
  styleUrl: './subscriptions.component.css'
})
export class SubscriptionsComponent implements OnInit {

  @ViewChild('cancelSubscriptionModal') cancelSubscriptionModal!: TemplateRef<any>;
  @ViewChild('subscribeModal') subscribeModal!: TemplateRef<any>;

  // Icons
  readonly CrownIcon = Crown;
  readonly CalendarIcon = Calendar;
  readonly CheckCircleIcon = CheckCircle;
  readonly XCircleIcon = XCircle;
  readonly ClockIcon = Clock;
  readonly UsersIcon = Users;
  readonly ZapIcon = Zap;
  readonly StarIcon = Star;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly PlusIcon = Plus;
  readonly BanIcon = Ban;
  readonly RefreshCwIcon = RefreshCw;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly PackageIcon = Package;
  readonly XIcon = X;

  // State
  currentSubscription = signal<SubscriptionModel | null>(null);
  activePlans = signal<SubscriptionPlanModel[]>([]);
  isAdmin = signal(false);
  tenantId = signal<number>(0);
  isLoading = signal(false);
  isPlansLoading = signal(false);
  isSubscribing = signal(false);
  isCancelling = signal(false);
  isCreatingPlan = signal(false);
  selectedPlan = signal<SubscriptionPlanModel | null>(null);


  createPlanForm!: FormGroup;

  readonly planTypes = ['BASIC', 'STANDARD', 'PREMIUM', 'ENTERPRISE'];

  constructor(
    private subscriptionsSvc: SubscriptionsService,
    private authSvc: AuthService,
    private toastSvc: ToastService,
    private modalSvc: ModalService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.authSvc.currentUser$.subscribe(user => {
      if (user) {
        this.tenantId.set(user.tenantId);
        this.isAdmin.set(
          user.userRoles?.includes('ADMIN') ||
          user.userRoles?.includes('SUPER_ADMIN') ||
          user.userType === 'ADMIN'
        );
        this.loadCurrentSubscription();
      }
    });
    this.loadActivePlans();
    this.initCreatePlanForm();
  }

  private initCreatePlanForm() {
    this.createPlanForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      type: ['BASIC', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      durationDays: [30, [Validators.required, Validators.min(1)]],
      maxUsers: [5, [Validators.required, Validators.min(1)]],
      isActive: [true]
    });
  }

  loadCurrentSubscription() {
    this.isLoading.set(true);
    this.subscriptionsSvc.getCurrentSubscription(
      this.tenantId(),
      (res: any) => {
        this.currentSubscription.set(res.data);
        this.isLoading.set(false);
      },
      (_err: any) => {
        this.currentSubscription.set(null);
        this.isLoading.set(false);
      }
    );
  }

  loadActivePlans() {
    this.isPlansLoading.set(true);
    this.subscriptionsSvc.getActivePlans(
      (res: any) => {
        this.activePlans.set(res.data || []);
        this.isPlansLoading.set(false);
      },
      (_err: any) => {
        this.toastSvc.show('Failed to load subscription plans', 'error');
        this.isPlansLoading.set(false);
      }
    );
  }

  openSubscribeModal(plan: SubscriptionPlanModel) {
    this.selectedPlan.set(plan);
    this.modalSvc.openTemplate(
      this.subscribeModal,
      plan,
      'md'
    )
  }

  confirmSubscribe() {
    const plan = this.selectedPlan();
    if (!plan) return;
    this.isSubscribing.set(true);
    this.subscriptionsSvc.subscribeTenant(
      this.tenantId(),
      plan.id,
      (_res: any) => {
        this.isSubscribing.set(false);
        this.toastSvc.show(`Subscribed to ${plan.name} successfully!`, 'success');
        this.closeModal();
        this.loadCurrentSubscription();
      },
      (err: any) => {
        this.isSubscribing.set(false);
        this.toastSvc.show(err?.error?.message || 'Failed to subscribe', 'error');
      }
    );
  }

  openCancelModal() {
    this.modalSvc.openTemplate(
      this.cancelSubscriptionModal,
      this.currentSubscription(),
      'md'
    )
  }

  confirmCancel() {
    const sub = this.currentSubscription();
    if (!sub) return;
    this.isCancelling.set(true);
    this.subscriptionsSvc.cancelSubscription(
      sub.id,
      (_res: any) => {
        this.isCancelling.set(false);
        this.toastSvc.show('Subscription cancelled successfully', 'success');
        this.closeModal();
        this.loadCurrentSubscription();
      },
      (err: any) => {
        this.isCancelling.set(false);
        this.toastSvc.show(err?.error?.message || 'Failed to cancel subscription', 'error');
      }
    );
  }


  toggleCreatePlanActive() {
    const current = this.createPlanForm.get('isActive')?.value;
    this.createPlanForm.patchValue({ isActive: !current });
  }

  onCreatePlan() {
    if (this.createPlanForm.invalid) return;
    this.isCreatingPlan.set(true);
    this.subscriptionsSvc.createPlan(
      this.createPlanForm.value,
      (_res: any) => {
        this.isCreatingPlan.set(false);
        this.toastSvc.show('Plan created successfully!', 'success');
        this.closeModal();
        this.loadActivePlans();
      },
      (err: any) => {
        this.isCreatingPlan.set(false);
        this.toastSvc.show(err?.error?.message || 'Failed to create plan', 'error');
      }
    );
  }

  closeModal() {
    this.modalSvc.close();
    this.selectedPlan.set(null);
  }

  isCurrentPlan(planId: number): boolean {
    return this.currentSubscription()?.plan?.id === planId &&
      this.currentSubscription()?.status === 'ACTIVE';
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'ACTIVE': 'bg-green-50 text-green-700 border border-green-100',
      'EXPIRED': 'bg-red-50 text-red-700 border border-red-100',
      'CANCELLED': 'bg-gray-100 text-gray-500 border border-gray-200',
      'PENDING': 'bg-yellow-50 text-yellow-700 border border-yellow-100'
    };
    return map[status] || 'bg-gray-100 text-gray-500 border border-gray-200';
  }

  getPlanAccentClass(type: string): {
    border: string; badge: string; icon: string; btn: string;
    iconBg: string; iconColor: string;
  } {
    const map: Record<string, any> = {
      'BASIC': {
        border: 'border-slate-200 hover:border-slate-300',
        badge: 'bg-slate-100 text-slate-600 border-slate-200',
        icon: 'text-slate-400',
        iconBg: 'bg-slate-100',
        iconColor: 'text-slate-500',
        btn: 'bg-slate-800 hover:bg-slate-900 text-white border-slate-800'
      },
      'STANDARD': {
        border: 'border-blue-100 hover:border-blue-300',
        badge: 'bg-blue-50 text-blue-600 border-blue-100',
        icon: 'text-blue-500',
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-500',
        btn: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
      },
      'PREMIUM': {
        border: 'border-purple-100 hover:border-purple-300',
        badge: 'bg-purple-50 text-purple-600 border-purple-100',
        icon: 'text-purple-500',
        iconBg: 'bg-purple-50',
        iconColor: 'text-purple-500',
        btn: 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600'
      },
      'ENTERPRISE': {
        border: 'border-amber-100 hover:border-amber-300',
        badge: 'bg-amber-50 text-amber-700 border-amber-100',
        icon: 'text-amber-500',
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-500',
        btn: 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500'
      }
    };
    return map[type] || map['BASIC'];
  }
}