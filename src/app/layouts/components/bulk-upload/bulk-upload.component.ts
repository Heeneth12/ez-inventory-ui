import { Component, signal, Input, Output, EventEmitter, computed } from '@angular/core';
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
  Trash2
} from 'lucide-angular';

type UploadStatus = 'idle' | 'selected' | 'uploading' | 'processing' | 'success' | 'error';

interface UploadResult {
  total: number;
  success: number;
  failed: number;
  errors: string[];
}

@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './bulk-upload.component.html'
})
export class BulkUploadComponent {
  // Icon Definitions for Template
  readonly UploadCloud = UploadCloud;
  readonly Download = Download;
  readonly FileText = FileText;
  readonly CheckCircle2 = CheckCircle2;
  readonly AlertCircle = AlertCircle;
  readonly X = X;
  readonly Loader2 = Loader2;
  readonly Filter = Filter;
  readonly Trash2 = Trash2;

  @Input() context: string = 'Data';
  @Output() close = new EventEmitter<void>();

  // State Management
  activeTab = signal<'upload' | 'download'>('upload');
  status = signal<UploadStatus>('idle');
  progress = signal(0);
  file = signal<File | null>(null);
  result = signal<UploadResult | null>(null);
  isDragging = false;
  isDownloading = signal<boolean>(false);

  // Download filters
  downloadFilters = {
    brand: '',
    category: '',
    fromDate: '',
    toDate: '',
    status: '',
    format: 'xlsx'
  };

  brands = [{ id: '1', name: 'Brand A' }, { id: '2', name: 'Brand B' }];
  categories = [{ id: '1', name: 'Category 1' }, { id: '2', name: 'Category 2' }];
  estimatedRecords = signal<number>(150);

  // Logic
  handleFile(file: File) {
    if (!file) return;
    const isExcel = file.name.match(/\.(xlsx|xls|csv)$/);
    if (isExcel) {
      this.file.set(file);
      this.status.set('selected');
    } else {
      alert('Please upload a valid CSV or Excel file.');
    }
  }

  uploadFile() {
    if (!this.file()) return;
    this.status.set('uploading');
    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      this.progress.set(p);
      if (p === 60) {
        clearInterval(interval);
        this.processFile();
      }
    }, 100);
  }

  processFile() {
    this.status.set('processing');
    const interval = setInterval(() => {
      this.progress.update(v => v + 10);
      if (this.progress() >= 100) {
        clearInterval(interval);
        this.finishUpload();
      }
    }, 150);
  }

  finishUpload() {
    this.result.set({
      total: 120,
      success: 118,
      failed: 2,
      errors: ["Row 4: SKU duplicate", "Row 9: Price missing"]
    });
    this.status.set('success');
  }

  clearFilters() {
    this.downloadFilters = { brand: '', category: '', fromDate: '', toDate: '', status: '', format: 'xlsx' };
  }

  removeFile() { this.file.set(null); this.status.set('idle'); }
  triggerClose() { if (this.status() !== 'uploading') this.close.emit(); }
  reset() { this.status.set('idle'); this.file.set(null); this.result.set(null); this.progress.set(0); }

  formatBytes(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + ['Bytes', 'KB', 'MB'][i];
  }

  onDragOver(e: DragEvent) { e.preventDefault(); this.isDragging = true; }
  onDragLeave(e: DragEvent) { this.isDragging = false; }
  onDrop(e: DragEvent) {
    e.preventDefault(); this.isDragging = false;
    if (e.dataTransfer?.files.length) this.handleFile(e.dataTransfer.files[0]);
  }
}