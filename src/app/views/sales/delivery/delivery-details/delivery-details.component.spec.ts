import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { DeliveryDetailsComponent } from './delivery-details.component';
import { DeliveryService } from '../delivery.service';
import { ToastService } from '../../../../layouts/components/toast/toastService';
import { LoaderService } from '../../../../layouts/components/loader/loaderService';
import { ConfirmationModalService } from '../../../../layouts/UI/confirmation-modal/confirmation-modal.service';
import { ShipmentStatus } from '../delivery.model';

describe('DeliveryDetailsComponent', () => {
  let component: DeliveryDetailsComponent;
  let fixture: ComponentFixture<DeliveryDetailsComponent>;

  const mockDeliveryService = {
    getDeliveryById: jasmine.createSpy(),
    updateDeliveryStatus: jasmine.createSpy()
  };
  const mockToast = { show: jasmine.createSpy() };
  const mockLoader = { show: jasmine.createSpy(), hide: jasmine.createSpy() };
  const mockConfirmation = { open: jasmine.createSpy().and.returnValue(Promise.resolve(false)) };
  const mockRouter = { navigate: jasmine.createSpy() };
  const mockRoute = { snapshot: { params: { id: '42' } } };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryDetailsComponent, FormsModule],
      providers: [
        { provide: DeliveryService, useValue: mockDeliveryService },
        { provide: ToastService, useValue: mockToast },
        { provide: LoaderService, useValue: mockLoader },
        { provide: ConfirmationModalService, useValue: mockConfirmation },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: DomSanitizer, useValue: { bypassSecurityTrustResourceUrl: (u: string) => u } },
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(DeliveryDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getInitials returns first two initials uppercased', () => {
    expect(component.getInitials('Ravi Kumar')).toBe('RK');
    expect(component.getInitials('John')).toBe('JO');
    expect(component.getInitials(undefined)).toBe('?');
  });

  it('getTypeLabel replaces underscores with spaces', () => {
    expect(component.getTypeLabel('IN_HOUSE_DELIVERY')).toBe('IN HOUSE DELIVERY');
    expect(component.getTypeLabel(undefined)).toBe('');
  });

  it('goBack navigates to parent route', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['../'], { relativeTo: mockRoute });
  });

  describe('openDeliverModal / closeDeliverModal', () => {
    it('openDeliverModal sets showDeliverModal true and resets state', () => {
      component.selectedPhotoFile = new File([''], 'test.jpg');
      component.photoPreviewUrl = 'data:image/jpeg;base64,abc';
      component.deliverNote = 'old note';
      component.openDeliverModal();
      expect(component.showDeliverModal).toBeTrue();
      expect(component.selectedPhotoFile).toBeNull();
      expect(component.photoPreviewUrl).toBeNull();
      expect(component.deliverNote).toBe('');
    });

    it('closeDeliverModal resets all deliver modal state', () => {
      component.showDeliverModal = true;
      component.selectedPhotoFile = new File([''], 'test.jpg');
      component.photoPreviewUrl = 'data:image/jpeg;base64,abc';
      component.deliverNote = 'note';
      component.isSubmitting = true;
      component.closeDeliverModal();
      expect(component.showDeliverModal).toBeFalse();
      expect(component.selectedPhotoFile).toBeNull();
      expect(component.photoPreviewUrl).toBeNull();
      expect(component.deliverNote).toBe('');
      expect(component.isSubmitting).toBeFalse();
    });
  });

  describe('confirmDelivery', () => {
    it('does nothing if no delivery loaded', () => {
      component.delivery = null;
      component.selectedPhotoFile = new File([''], 'test.jpg');
      component.confirmDelivery();
      expect(mockDeliveryService.updateDeliveryStatus).not.toHaveBeenCalled();
    });

    it('does nothing if no photo selected', () => {
      (component as any).delivery = { id: 1, status: 'SHIPPED' };
      component.selectedPhotoFile = null;
      component.confirmDelivery();
      expect(mockDeliveryService.updateDeliveryStatus).not.toHaveBeenCalled();
    });

    it('does nothing if already submitting', () => {
      (component as any).delivery = { id: 1, status: 'SHIPPED' };
      component.selectedPhotoFile = new File([''], 'test.jpg');
      component.isSubmitting = true;
      component.confirmDelivery();
      expect(mockDeliveryService.updateDeliveryStatus).not.toHaveBeenCalled();
    });
  });

  describe('openRescheduleModal / closeRescheduleModal', () => {
    it('openRescheduleModal sets modal open with tomorrows date and empty reason', () => {
      component.openRescheduleModal();
      expect(component.showRescheduleModal).toBeTrue();
      expect(component.rescheduleDate).toBeTruthy();
      expect(component.rescheduleReason).toBe('');
      expect(component.rescheduleModalTitle).toBe('Reschedule Delivery');
    });

    it('openScheduleModal sets title to Schedule Delivery', () => {
      component.openScheduleModal();
      expect(component.rescheduleModalTitle).toBe('Schedule Delivery');
      expect(component.showRescheduleModal).toBeTrue();
    });

    it('closeRescheduleModal resets state', () => {
      component.showRescheduleModal = true;
      component.rescheduleDate = '2026-04-25';
      component.rescheduleReason = 'test';
      component.closeRescheduleModal();
      expect(component.showRescheduleModal).toBeFalse();
      expect(component.rescheduleDate).toBe('');
      expect(component.rescheduleReason).toBe('');
    });
  });

  describe('confirmReschedule', () => {
    it('does nothing if no delivery', () => {
      component.delivery = null;
      component.rescheduleDate = '2026-04-25';
      component.rescheduleReason = 'reason';
      component.confirmReschedule();
      expect(mockDeliveryService.updateDeliveryStatus).not.toHaveBeenCalled();
    });

    it('does nothing if reason is blank', () => {
      (component as any).delivery = { id: 1, status: 'SHIPPED' };
      component.rescheduleDate = '2026-04-25';
      component.rescheduleReason = '   ';
      component.confirmReschedule();
      expect(mockDeliveryService.updateDeliveryStatus).not.toHaveBeenCalled();
    });
  });

  describe('openCancelModal / confirmCancel', () => {
    it('openCancelModal sets showCancelModal true', () => {
      component.openCancelModal();
      expect(component.showCancelModal).toBeTrue();
      expect(component.cancelReason).toBe('');
    });

    it('confirmCancel does nothing if reason is blank', () => {
      (component as any).delivery = { id: 1, status: 'PENDING' };
      component.cancelReason = '   ';
      component.confirmCancel();
      expect(mockDeliveryService.updateDeliveryStatus).not.toHaveBeenCalled();
    });
  });

  describe('isStepCompleted / isStepActive', () => {
    it('isStepActive returns true only for current status', () => {
      (component as any).delivery = { id: 1, status: 'SHIPPED' };
      expect(component.isStepActive('SHIPPED')).toBeTrue();
      expect(component.isStepActive('PENDING')).toBeFalse();
    });

    it('Pending step completed when status is SHIPPED', () => {
      (component as any).delivery = { id: 1, status: 'SHIPPED', scheduledDate: null };
      expect(component.isStepCompleted('PENDING')).toBeTrue();
    });

    it('SCHEDULED step not completed when status is PENDING', () => {
      (component as any).delivery = { id: 1, status: 'PENDING' };
      expect(component.isStepCompleted('SCHEDULED')).toBeFalse();
    });

    it('DELIVERED step completed only when status is DELIVERED', () => {
      (component as any).delivery = { id: 1, status: 'SHIPPED' };
      expect(component.isStepCompleted('DELIVERED')).toBeFalse();
      (component as any).delivery = { id: 1, status: 'DELIVERED' };
      expect(component.isStepCompleted('DELIVERED')).toBeTrue();
    });
  });
});
