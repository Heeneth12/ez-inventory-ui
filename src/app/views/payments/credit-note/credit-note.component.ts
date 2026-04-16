import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { StandardTableComponent } from '../../../layouts/components/standard-table/standard-table.component';
import { PaginationConfig, TableAction, TableColumn } from '../../../layouts/components/standard-table/standard-table.model';
import { ToastService } from '../../../layouts/components/toast/toastService';
import { DatePickerConfig, DateRangeEmit } from '../../../layouts/UI/date-picker/date-picker.component';
import {
    CREDIT_NOTE_ACTIONS,
    CREDIT_NOTE_COLUMNS,
    CREDIT_NOTE_DATE_CONFIG,
    CREDIT_NOTE_FILTER_OPTIONS
} from '../paymentConfig';
import { CreditNoteModal, CreditNoteRefundItem } from '../payment.modal';
import { PaymentService } from '../payment.service';

type PanelMode = 'none' | 'utilize' | 'refund' | 'detail';

@Component({
    selector: 'app-credit-note',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, StandardTableComponent],
    templateUrl: './credit-note.component.html',
    styleUrl: './credit-note.component.css'
})
export class CreditNoteComponent implements OnInit {

    @Input() customerId?: number;

    // Table state
    creditNoteList: CreditNoteModal[] = [];
    pagination: PaginationConfig = { pageSize: 15, currentPage: 1, totalItems: 0 };
    isLoading = false;
    columns: TableColumn[] = CREDIT_NOTE_COLUMNS;
    filterOptions = CREDIT_NOTE_FILTER_OPTIONS;
    dateConfig: DatePickerConfig = CREDIT_NOTE_DATE_CONFIG;
    creditNoteActions = CREDIT_NOTE_ACTIONS;
    creditNoteFilter: any = {};
    private tableState$ = new Subject<void>();

    // Side panel
    selectedNote: CreditNoteModal | null = null;
    panelMode: PanelMode = 'none';
    isSubmitting = signal(false);

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
            this.creditNoteFilter.customerId = this.customerId;
        }
        this.setupTablePipeline();
        this.tableState$.next();
    }

    private buildForms(): void {
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
        this.tableState$.pipe(debounceTime(300)).subscribe(() => this.loadCreditNotes());
    }

    loadCreditNotes(): void {
        this.isLoading = true;
        const apiPage = this.pagination.currentPage > 0 ? this.pagination.currentPage - 1 : 0;
        this.paymentService.getAllCreditNotes(
            apiPage,
            this.pagination.pageSize,
            this.creditNoteFilter,
            (res: any) => {
                this.creditNoteList = res.data.content;
                this.pagination = {
                    currentPage: this.pagination.currentPage,
                    totalItems: res.data.totalElements,
                    pageSize: res.data.size
                };
                this.isLoading = false;
            },
            () => {
                this.isLoading = false;
                this.toastSvc.show('Failed to load credit notes', 'error');
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
        this.creditNoteFilter.fromDate = range.from ? this.formatDate(range.from) : null;
        this.creditNoteFilter.toDate = range.to ? this.formatDate(range.to) : null;
        this.tableState$.next();
    }

    onFilterUpdate(event: Record<string, any>): void {
        this.creditNoteFilter.statuses = event['status'] || null;
        this.tableState$.next();
    }

    onTableAction(event: TableAction): void {
        const { key, row } = event;
        const note = row as CreditNoteModal;
        if (key === 'view_detail') this.openDetail(note);
        else if (key === 'utilize') this.openUtilize(note);
        else if (key === 'refund') this.openRefund(note);
    }

    // ── Panel actions ─────────────────────────────────────────────────────────

    openDetail(note: CreditNoteModal): void {
        this.selectedNote = note;
        this.panelMode = 'detail';
        this.paymentService.getCreditNote(
            note.id,
            (res: any) => { this.selectedNote = res.data; },
            () => { }
        );
    }

    openUtilize(note: CreditNoteModal): void {
        this.selectedNote = note;
        this.utilizeForm.reset({ remarks: '' });
        this.utilizeForm.patchValue({ amount: note.availableBalance });
        this.panelMode = 'utilize';
    }

    openRefund(note: CreditNoteModal): void {
        this.selectedNote = note;
        this.refundForm.reset({ refundMethod: 'CASH' });
        this.refundForm.patchValue({ refundAmount: note.availableBalance });
        this.panelMode = 'refund';
    }

    closePanel(): void {
        this.panelMode = 'none';
        this.selectedNote = null;
    }

    // ── Submissions ───────────────────────────────────────────────────────────

    submitUtilize(): void {
        if (this.utilizeForm.invalid || !this.selectedNote) return;
        this.isSubmitting.set(true);
        this.paymentService.utilizeCreditNote(
            { ...this.utilizeForm.value, creditNoteId: this.selectedNote.id },
            () => {
                this.isSubmitting.set(false);
                this.toastSvc.show('Credit note applied to invoice', 'success');
                this.panelMode = 'none';
                this.tableState$.next();
            },
            (err: any) => {
                this.isSubmitting.set(false);
                this.toastSvc.show(err?.error?.message || 'Failed to utilize credit note', 'error');
            }
        );
    }

    submitRefund(): void {
        if (this.refundForm.invalid || !this.selectedNote) return;
        this.isSubmitting.set(true);
        this.paymentService.refundCreditNote(
            { ...this.refundForm.value, creditNoteId: this.selectedNote.id },
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

    confirmRefund(refund: CreditNoteRefundItem): void {
        this.paymentService.confirmCreditNoteRefund(
            refund.id,
            () => {
                this.toastSvc.show('Refund confirmed — funds cleared', 'success');
                if (this.selectedNote) this.openDetail(this.selectedNote);
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
