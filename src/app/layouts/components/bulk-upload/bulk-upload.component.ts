import { Component, signal, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  UploadCloud,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Filter,
  Trash2,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-angular';
import { HttpErrorResponse } from '@angular/common/http';
import { BulkUploadService } from './bulk-upload.service';
import { LoaderService } from '../loader/loaderService';
import { ToastService } from '../toast/toastService';

type UploadStatus = 'idle' | 'selected' | 'uploading' | 'success' | 'error';

interface UploadResult {
  message: string;
  // Adjust these based on your actual backend response structure
  totalProcessed?: number;
  successCount?: number;
  failureCount?: number;
  errors?: string[];
}

@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './bulk-upload.component.html',
  styles: [`
    :host { display: block; height: 100%; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class BulkUploadComponent {

  // Icons
  readonly icons = {
    UploadCloud, Download, FileText, CheckCircle2, AlertCircle,
    X, Loader2, Filter, Trash2, FileSpreadsheet, AlertTriangle
  };

  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  // State
  activeTab = signal<'upload' | 'download'>('upload');
  status = signal<UploadStatus>('idle');
  isDragging = signal(false);

  // File State
  file = signal<File | null>(null);
  uploadResult = signal<UploadResult | null>(null);
  errorMessage = signal<string>('');

  // Download State
  isDownloading = signal(false);
  filters = {
    searchQuery: '', // Matches your ItemFilterDto
    brand: '',
    category: '',
    status: ''
  };

  constructor(private bulkService: BulkUploadService,
    private loaderService: LoaderService,
    private toastService: ToastService
  ) {

  }

  handleFile(file: File) {
    if (!file) return;

    // Validate Extension
    const validExts = ['.xlsx', '.xls', '.csv'];
    const isExcel = validExts.some(ext => file.name.toLowerCase().endsWith(ext));

    // Validate Size (e.g., 10MB)
    const isValidSize = file.size < 10 * 1024 * 1024;

    if (!isExcel) {
      this.showError('Invalid file format. Please upload an Excel or CSV file.');
      return;
    }
    if (!isValidSize) {
      this.showError('File is too large. Maximum size is 10MB.');
      return;
    }

    this.file.set(file);
    this.status.set('selected');
    this.errorMessage.set('');
  }

  startUpload() {
    const currentFile = this.file();
    if (!currentFile) return;

    this.status.set('uploading');
    this.errorMessage.set('');

    this.bulkService.bulkItemsUpload(
      currentFile,
      (response: any) => {
        // Success Callback
        this.status.set('success');
        this.uploadResult.set({
          message: response.message,
          // Map these if your backend returns them, otherwise defaults
          totalProcessed: response.data?.totalProcessed || 0,
          successCount: response.data?.successCount || 0,
          failureCount: response.data?.failureCount || 0,
          errors: response.data?.errors || []
        });
        this.success.emit(); // Notify parent to refresh list
      },
      (error: HttpErrorResponse) => {
        // Error Callback
        this.status.set('error');
        const msg = error.error?.message || error.message || 'Upload failed unexpectedly.';
        this.errorMessage.set(msg);
      }
    );
  }

  downloadTemplate() {
    this.isDownloading.set(true);
    this.bulkService.downloadItemsTemplate(
      () => {
        this.isDownloading.set(false);
        // Optional: Show a toast here
        this.toastService.show("Template downloaded successfully.", 'success');
      }
      ,
      (error: any) => {
        this.isDownloading.set(false);
        this.toastService.show("Failed to download template. Please try again.", 'error');
      }
    );
  }

  startDownload() {
    this.isDownloading.set(true);

    // Clean filters (remove empty strings)
    const activeFilters = Object.fromEntries(
      Object.entries(this.filters).filter(([_, v]) => v !== '')
    );

    this.bulkService.bulkItemsDownload(
      activeFilters,
      () => {
        this.isDownloading.set(false);
        this.toastService.show("Items downloaded successfully.", 'success');
      },
      (error: any) => {
        this.isDownloading.set(false);
        this.toastService.show("Failed to download template. Please try again.", 'error');
      }
    );
  }

  removeFile() {
    this.file.set(null);
    this.status.set('idle');
    this.errorMessage.set('');
    this.uploadResult.set(null);
  }

  reset() {
    this.removeFile();
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  showError(msg: string) {
    this.errorMessage.set(msg);
    setTimeout(() => this.errorMessage.set(''), 4000);
  }

  // Drag Events
  onDragOver(e: DragEvent) { e.preventDefault(); e.stopPropagation(); this.isDragging.set(true); }
  onDragLeave(e: DragEvent) { e.preventDefault(); e.stopPropagation(); this.isDragging.set(false); }
  onDrop(e: DragEvent) {
    e.preventDefault(); e.stopPropagation(); this.isDragging.set(false);
    if (e.dataTransfer?.files.length) this.handleFile(e.dataTransfer.files[0]);
  }
}