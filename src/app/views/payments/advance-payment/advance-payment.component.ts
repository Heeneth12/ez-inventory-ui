import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { StandardTableComponent } from '../../../layouts/components/standard-table/standard-table.component';
import { PaginationConfig, TableAction, TableColumn } from '../../../layouts/components/standard-table/standard-table.model';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { DatePickerConfig, DateRangeEmit } from '../../../layouts/UI/date-picker/date-picker.component';
import {
    ADVANCE_ACTIONS,
    ADVANCE_COLUMNS,
    ADVANCE_DATE_CONFIG,
    ADVANCE_FILTER_OPTIONS
} from '../paymentConfig';
import { AdvanceModal, AdvanceRefundItem } from '../payment.modal';
import { PaymentService } from '../payment.service';

type PanelMode = 'none' | 'create' | 'utilize' | 'refund' | 'detail';

@Component({
    selector: 'app-advance-payment',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, StandardTableComponent],
    templateUrl: './advance-payment.component.html',
    styleUrl: './advance-payment.component.css'
})
export class AdvancePaymentComponent implements OnInit {

    @Input() customerId?: number;

    // Table state
    advanceList: AdvanceModal[] = [];
    pagination: PaginationConfig = { pageSize: 15, currentPage: 1, totalItems: 0 };
    isLoading = false;
    columns: TableColumn[] = ADVANCE_COLUMNS;
    filterOptions = ADVANCE_FILTER_OPTIONS;
    dateConfig: DatePickerConfig = ADVANCE_DATE_CONFIG;
    advanceActions = ADVANCE_ACTIONS;
    advanceFilter: any = {};
    private tableState$ = new Subject<void>();

    // Side panel
    selectedAdvance: AdvanceModal | null = null;
    panelMode: PanelMode = 'none';
    isSubmitting = signal(false);

    createForm!: FormGroup;
    utilizeForm!: FormGroup;
    refundForm!: FormGroup;

    readonly PAYMENT_METHODS = ['CASH', 'BANK_TRANSFER', 'CHEQUE', 'UPI', 'NEFT', 'RTGS'];

    constructor(
        private fb: FormBuilder,
        private paymentService: PaymentService,
        private toastSvc: ToastService
    ) { }

    ngOnInit(): void {
        this.buildForms();
        if (this.customerId) {
            this.advanceFilter.customerId = this.customerId;
        }
        this.setupTablePipeline();
        this.tableState$.next();
    }

    private buildForms(): void {
        this.createForm = this.fb.group({
            amount: [null, [Validators.required, Validators.min(1)]],
            paymentMethod: ['CASH', Validators.required],
            referenceNumber: [''],
            bankName: [''],
            remarks: ['']
        });

        this.utilizeForm = this.fb.group({
            invoiceId: [null, [Validators.required, Validators.min(1)]],
            amount: [null, [Validators.required, Validators.min(1)]],
            remarks: ['']
        });

        this.refundForm = this.fb.group({
            refundAmount: [null, [Validators.required, Validators.min(1)]],
            refundMethod: ['CASH', Validators.required],
            refundReferenceNumber: [''],
            remarks: ['']
        });
    }

    private setupTablePipeline(): void {
        this.tableState$.pipe(debounceTime(300)).subscribe(() => this.loadAdvances());
    }

    loadAdvances(): void {
        this.isLoading = true;
        const apiPage = this.pagination.currentPage > 0 ? this.pagination.currentPage - 1 : 0;
        this.paymentService.getAllAdvances(
            apiPage,
            this.pagination.pageSize,
            this.advanceFilter,
            (res: any) => {
                this.advanceList = res.data.content;
                this.pagination = {
                    currentPage: this.pagination.currentPage,
                    totalItems: res.data.totalElements,
                    pageSize: res.data.size
                };
                this.isLoading = false;
            },
            () => {
                this.isLoading = false;
                this.toastSvc.show('Failed to load advances', 'error');
            }
        );
    }

    // ── Table events ──────────────────────────────────────────────────────────

    onPageChange(newPage: number): void {
        this.pagination = { ...this.pagination, currentPage: newPage };
        this.tableState$.next();
    }

    onLoadMore(): void { }

    onFilterDate(range: DateRangeEmit): void {
        this.advanceFilter.fromDate = range.from ? this.formatDate(range.from) : null;
        this.advanceFilter.toDate = range.to ? this.formatDate(range.to) : null;
        this.tableState$.next();
    }

    onFilterUpdate(event: Record<string, any>): void {
        this.advanceFilter.statuses = event['status'] || null;
        this.tableState$.next();
    }

    onTableAction(event: TableAction): void {
        const { key, row } = event;
        const advance = row as AdvanceModal;
        if (key === 'view_detail') this.openDetail(advance);
        else if (key === 'utilize') this.openUtilize(advance);
        else if (key === 'refund') this.openRefund(advance);
    }

    // ── Panel actions ─────────────────────────────────────────────────────────

    openCreate(): void {
        this.selectedAdvance = null;
        this.createForm.reset({ paymentMethod: 'CASH' });
        this.panelMode = 'create';
    }

    openDetail(advance: AdvanceModal): void {
        this.selectedAdvance = advance;
        this.panelMode = 'detail';
        this.paymentService.getAdvance(
            advance.id,
            (res: any) => { this.selectedAdvance = res.data; },
            () => { }
        );
    }

    openUtilize(advance: AdvanceModal): void {
        this.selectedAdvance = advance;
        this.utilizeForm.reset({ remarks: '' });
        this.utilizeForm.patchValue({ amount: advance.availableBalance });
        this.panelMode = 'utilize';
    }

    openRefund(advance: AdvanceModal): void {
        this.selectedAdvance = advance;
        this.refundForm.reset({ refundMethod: 'CASH' });
        this.refundForm.patchValue({ refundAmount: advance.availableBalance });
        this.panelMode = 'refund';
    }

    closePanel(): void {
        this.panelMode = 'none';
        this.selectedAdvance = null;
    }

    // ── Submissions ───────────────────────────────────────────────────────────

    submitCreate(): void {
        if (this.createForm.invalid) return;
        this.isSubmitting.set(true);
        const cid = this.customerId;
        this.paymentService.createAdvance(
            { ...this.createForm.value, customerId: cid },
            () => {
                this.isSubmitting.set(false);
                this.toastSvc.show('Advance created successfully', 'success');
                this.panelMode = 'none';
                this.tableState$.next();
            },
            (err: any) => {
                this.isSubmitting.set(false);
                this.toastSvc.show(err?.error?.message || 'Failed to create advance', 'error');
            }
        );
    }

    submitUtilize(): void {
        if (this.utilizeForm.invalid || !this.selectedAdvance) return;
        this.isSubmitting.set(true);
        this.paymentService.utilizeAdvance(
            { ...this.utilizeForm.value, advanceId: this.selectedAdvance.id },
            () => {
                this.isSubmitting.set(false);
                this.toastSvc.show('Advance applied to invoice', 'success');
                this.panelMode = 'none';
                this.tableState$.next();
            },
            (err: any) => {
                this.isSubmitting.set(false);
                this.toastSvc.show(err?.error?.message || 'Failed to utilize advance', 'error');
            }
        );
    }

    submitRefund(): void {
        if (this.refundForm.invalid || !this.selectedAdvance) return;
        this.isSubmitting.set(true);
        this.paymentService.refundAdvance(
            { ...this.refundForm.value, advanceId: this.selectedAdvance.id },
            () => {
                this.isSubmitting.set(false);
                this.toastSvc.show('Refund initiated successfully', 'success');
                this.panelMode = 'none';
                this.tableState$.next();
            },
            (err: any) => {
                this.isSubmitting.set(false);
                this.toastSvc.show(err?.error?.message || 'Failed to initiate refund', 'error');
            }
        );
    }

    confirmRefund(refund: AdvanceRefundItem): void {
        this.paymentService.confirmAdvanceRefund(
            refund.id,
            () => {
                this.toastSvc.show('Refund confirmed — funds cleared', 'success');
                if (this.selectedAdvance) this.openDetail(this.selectedAdvance);
                this.tableState$.next();
            },
            (err: any) => {
                this.toastSvc.show(err?.error?.message || 'Failed to confirm refund', 'error');
            }
        );
    }

    refundStatusBadge(status: string): string {
        return status === 'CLEARED'
            ? 'bg-green-100 text-green-700'
            : 'bg-amber-100 text-amber-700';
    }

    private formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }
}
