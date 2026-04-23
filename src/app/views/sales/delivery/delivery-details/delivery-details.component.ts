import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  ArrowLeft, CalendarClock, Camera, Check, CheckCircle, ChevronDown, ChevronUp,
  Clock, ClockFadingIcon, Image, LucideAngularModule, MapPin, Package, Route, StepForward, Truck, User, X, XCircle
} from 'lucide-angular';
import { DeliveryModel, DeliveryStatusUpdateRequest, ShipmentStatus } from '../delivery.model';
import { DeliveryService } from '../delivery.service';
import { ToastService } from '../../../../layouts/components/toast/toastService';
import { ConfirmationModalService } from '../../../../layouts/UI/confirmation-modal/confirmation-modal.service';
import { FileManagerService } from '../../../file-manager/file-manager.service';
import { ModalService } from '../../../../layouts/components/modal/modalService';

@Component({
  selector: 'app-delivery-details',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, FormsModule],
  templateUrl: './delivery-details.component.html',
  styleUrl: './delivery-details.component.css'
})
export class DeliveryDetailsComponent implements OnInit {

  readonly ArrowLeftIcon = ArrowLeft;
  readonly MapPinIcon = MapPin;
  readonly TruckIcon = Truck;
  readonly CheckCircleIcon = CheckCircle;
  readonly ClockIcon = Clock;
  readonly XCircleIcon = XCircle;
  readonly CheckIcon = Check;
  readonly CalendarClockIcon = CalendarClock;
  readonly UserIcon = User;
  readonly RouteIcon = Route;
  readonly ChevronDownIcon = ChevronDown;
  readonly ChevronUpIcon = ChevronUp;
  readonly PackageIcon = Package;
  readonly CameraIcon = Camera;
  readonly ImageIcon = Image;
  readonly XIcon = X;
  readonly Steppe = StepForward;
  readonly ClockFadingIcon = ClockFadingIcon;

  delivery: DeliveryModel | null = null;
  deliveryStatusUpdate: DeliveryStatusUpdateRequest = new DeliveryStatusUpdateRequest();
  isLoading = false;

  // modals
  @ViewChild('cancelModal') cancelModal!: any;
  @ViewChild('scheduleModal') scheduleModal!: any;
  @ViewChild('deliverModal') deliverModal!: any;

  // Accordion state
  showItems = false;
  showMap = false;

  // Deliver modal
  showDeliverModal = false;
  selectedPhotoFile: File | null = null;
  photoPreviewUrl: string | null = null;
  deliverNote = '';
  isSubmitting = false;

  // Reschedule modal
  rescheduleDate = '';
  rescheduleReason = '';
  rescheduleModalTitle = 'Schedule Delivery';

  // Cancel modal
  cancelReason = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deliveryService: DeliveryService,
    private toastService: ToastService,
    private sanitizer: DomSanitizer,
    private fileManagerService: FileManagerService,
    private modalService: ModalService,
    private confirmationModalService: ConfirmationModalService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadDelivery(id);
  }

  loadDelivery(id: string): void {
    this.isLoading = true;
    this.deliveryService.getDeliveryById(id,
      (res: any) => {
        this.delivery = res.data;
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
        this.toastService.show('Failed to load delivery details', 'error');
        this.router.navigate(['../'], { relativeTo: this.route });
      }
    );
  }

  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  updateDelivaryStatus(
    id: number | string,
    status: ShipmentStatus,
    reason: string | null = null,
    scheduledDate: Date | null = null,
    file: File | null = null,
    onSuccess?: () => void,
    onError?: () => void
  ): void {
    this.deliveryStatusUpdate.status = status;
    this.deliveryStatusUpdate.reason = reason;
    this.deliveryStatusUpdate.scheduledDate = scheduledDate ? new Date(scheduledDate) : null;
    this.deliveryService.updateDeliveryStatus(
      id,
      this.deliveryStatusUpdate,
      file,
      () => {
        this.toastService.show('Delivery updated successfully', 'success');
        this.loadDelivery(String(id));
        onSuccess?.();
      },
      () => {
        this.toastService.show('Failed to update delivery', 'error');
        onError?.();
      }
    );
  }

  // ── Move to Shipping ──
  markAsShipped(): void {
    if (!this.delivery) return;
    this.updateDelivaryStatus(this.delivery.id, ShipmentStatus.SHIPPED);
  }

  // ── Deliver modal ──
  openDeliverModal(): void {
    this.selectedPhotoFile = null;
    this.photoPreviewUrl = null;
    this.deliverNote = '';
    this.isSubmitting = false;
    this.showDeliverModal = true;
  }

  closeDeliverModal(): void {
    this.showDeliverModal = false;
    this.selectedPhotoFile = null;
    this.photoPreviewUrl = null;
    this.deliverNote = '';
    this.isSubmitting = false;
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.selectedPhotoFile = file;
    const reader = new FileReader();
    reader.onload = (e) => { this.photoPreviewUrl = e.target?.result as string; };
    reader.readAsDataURL(file);
  }

  confirmDelivery(): void {
    if (!this.delivery || !this.selectedPhotoFile || this.isSubmitting) return;
    this.isSubmitting = true;
    this.updateDelivaryStatus(
      this.delivery.id,
      ShipmentStatus.DELIVERED,
      this.deliverNote.trim() || null,
      null,
      this.selectedPhotoFile,
      () => { this.closeDeliverModal(); },
      () => { this.isSubmitting = false; }
    );
  }

  // Reschedule / Schedule modal
  openScheduleModal(): void {
    this.rescheduleModalTitle = 'Schedule Delivery';
    this._openRescheduleModal();
  }

  openRescheduleModal(): void {
    this.rescheduleModalTitle = 'Reschedule Delivery';
    this._openRescheduleModal();
  }

  private _openRescheduleModal(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.rescheduleDate = tomorrow.toISOString().split('T')[0];
    this.rescheduleReason = '';
    this.modalService.openTemplate(this.scheduleModal);
  }



  confirmReschedule(): void {
    if (!this.delivery || !this.rescheduleDate || !this.rescheduleReason.trim()) return;
    this.updateDelivaryStatus(
      this.delivery.id,
      ShipmentStatus.SCHEDULED,
      this.rescheduleReason.trim(),
      new Date(this.rescheduleDate),
      null,
      () => { this.closeModal(); }
    );
  }

  // Cancel modal
  openCancelModal(): void {
    this.cancelReason = '';
    this.modalService.openTemplate(this.cancelModal);
  }



  confirmCancel(): void {
    if (!this.delivery || !this.cancelReason.trim()) return;
    this.updateDelivaryStatus(
      this.delivery.id,
      ShipmentStatus.CANCELLED,
      this.cancelReason.trim(),
      null,
      null,
      () => { this.closeModal(); }
    );
  }


  viewPhoto() {
    if (this.delivery?.attachmentUuid) {
      this.fileManagerService.getPresignedUrl(this.delivery?.attachmentUuid, 60,
        (res: any) => window.open(res.url || res.data?.url, '_blank'),
        (err: any) => console.error('Could not load profile picture', err)
      );
    }
  }


  closeModal() {
    this.modalService.close();
    this.rescheduleReason = '';
    this.cancelReason = '';
    this.rescheduleDate = '';
  }

  showScheduleModal() {
    this.rescheduleModalTitle = 'Schedule Delivery';
    this._openRescheduleModal();
  }

  // ── Stepper helpers ──
  isStepCompleted(step: 'PENDING' | 'SCHEDULED' | 'SHIPPED' | 'DELIVERED'): boolean {
    if (!this.delivery) return false;
    const s = this.delivery.status;
    if (step === 'PENDING') return s !== 'PENDING';
    if (step === 'SCHEDULED') return s === 'SHIPPED' || s === 'DELIVERED' || (s === 'CANCELLED' && !!this.delivery.scheduledDate);
    if (step === 'SHIPPED') return s === 'DELIVERED' || (s === 'CANCELLED' && !!this.delivery.shippedDate);
    if (step === 'DELIVERED') return s === 'DELIVERED';
    return false;
  }

  isStepActive(step: 'PENDING' | 'SCHEDULED' | 'SHIPPED' | 'DELIVERED'): boolean {
    return this.delivery?.status === step;
  }

  connectorDone(from: 'P_S' | 'S_SH' | 'SH_D'): boolean {
    if (!this.delivery) return false;
    const s = this.delivery.status;
    if (from === 'P_S') return s === 'SCHEDULED' || s === 'SHIPPED' || s === 'DELIVERED' || (s === 'CANCELLED' && !!this.delivery.scheduledDate);
    if (from === 'S_SH') return s === 'SHIPPED' || s === 'DELIVERED' || (s === 'CANCELLED' && !!this.delivery.shippedDate);
    if (from === 'SH_D') return s === 'DELIVERED';
    return false;
  }

  getTomorrowDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }

  // ── Misc helpers ──
  toggleItemsAccordion(): void { this.showItems = !this.showItems; }
  toggleMapAccordion(): void { this.showMap = !this.showMap; }

  getMapUrl(address?: string): SafeResourceUrl {
    const dest = encodeURIComponent(address || 'Chennai');
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://maps.google.com/maps?q=${dest}&z=14&output=embed`
    );
  }

  getInitials(name?: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  getTypeLabel(type?: string): string {
    return (type || '').replace(/_/g, ' ');
  }

}
