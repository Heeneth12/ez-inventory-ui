import { Component, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  templateUrl: './bulk-upload.component.html',
  styleUrls: ['./bulk-upload.component.css']
})
export class BulkUploadComponent {

  @Input() context: string = 'Data';
  @Input() someData: any; // Example of other data passed from openComponent
  @Output() close = new EventEmitter<void>();

  status = signal<UploadStatus>('idle');
  progress = signal(0);
  file = signal<File | null>(null);
  result = signal<UploadResult | null>(null);
  isDragging = false;

  triggerClose() {
    if (this.status() === 'uploading' || this.status() === 'processing') return;
    this.close.emit();
  }

  reset() {
    this.status.set('idle');
    this.progress.set(0);
    this.file.set(null);
    this.result.set(null);
  }

  onFileSelected(event: any) { this.handleFile(event.target.files[0]); }

  handleFile(file: File) {
    if (!file) return;
    if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.type.includes('spreadsheet') || file.type.includes('csv')) {
      this.file.set(file);
      this.status.set('selected');
    } else {
      alert('Please upload a valid CSV or Excel file.');
    }
  }

  removeFile() { this.file.set(null); this.status.set('idle'); }

  onDragOver(e: DragEvent) { e.preventDefault(); e.stopPropagation(); this.isDragging = true; }
  onDragLeave(e: DragEvent) { e.preventDefault(); e.stopPropagation(); this.isDragging = false; }
  onDrop(e: DragEvent) {
    e.preventDefault(); e.stopPropagation(); this.isDragging = false;
    if (e.dataTransfer?.files.length) this.handleFile(e.dataTransfer.files[0]);
  }

  uploadFile() {
    if (!this.file()) return;
    this.status.set('uploading');
    this.progress.set(0);

    const uploadInterval = setInterval(() => {
      this.progress.update(p => {
        if (p >= 60) {
          clearInterval(uploadInterval);
          this.processFile();
          return 60;
        }
        return p + 5;
      });
    }, 150);
  }

  processFile() {
    this.status.set('processing');
    const processInterval = setInterval(() => {
      this.progress.update(p => {
        if (p >= 100) {
          clearInterval(processInterval);
          this.finishUpload();
          return 100;
        }
        return p + 10;
      });
    }, 200);
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

  formatBytes(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + ['Bytes', 'KB', 'MB'][i];
  }
}