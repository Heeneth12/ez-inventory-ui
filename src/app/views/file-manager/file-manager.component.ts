import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, ViewChild, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LucideAngularModule, Upload, FolderOpen, File, FileText, Image,
  FileSpreadsheet, Download, Trash2, Eye, Search, Grid, List,
  RefreshCw, X, AlertTriangle, Filter, Tag, Link, CheckCircle, Clock
} from 'lucide-angular';
import { FileManagerService } from './file-manager.service';
import {
  FileRecordModel, FileReferenceType, FileType,
  FILE_REFERENCE_TYPES, FILE_TYPES
} from './file-manager.model';
import { AuthService } from '../../layouts/guards/auth.service';
import { ModalService } from '../../layouts/components/modal/modalService';
import { ToastService } from '../../layouts/components/toast/toastService';

@Component({
  selector: 'app-file-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './file-manager.component.html',
  styleUrl: './file-manager.component.css'
})
export class FileManagerComponent implements OnInit {

  @ViewChild('uploadModal') uploadModalTemplate!: any;
  @ViewChild('previewModal') previewModalTemplate!: any;
  @ViewChild('deleteModal') deleteModalTemplate!: any;

  // Icons
  readonly UploadIcon = Upload;
  readonly FolderOpenIcon = FolderOpen;
  readonly FileIcon = File;
  readonly FileTextIcon = FileText;
  readonly ImageIcon = Image;
  readonly FileSpreadsheetIcon = FileSpreadsheet;
  readonly DownloadIcon = Download;
  readonly Trash2Icon = Trash2;
  readonly EyeIcon = Eye;
  readonly SearchIcon = Search;
  readonly GridIcon = Grid;
  readonly ListIcon = List;
  readonly RefreshCwIcon = RefreshCw;
  readonly XIcon = X;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly FilterIcon = Filter;
  readonly TagIcon = Tag;
  readonly LinkIcon = Link;
  readonly CheckCircleIcon = CheckCircle;
  readonly ClockIcon = Clock;

  // Enums for template
  readonly referenceTypes = FILE_REFERENCE_TYPES;
  readonly fileTypes = FILE_TYPES;

  // State
  files = signal<FileRecordModel[]>([]);
  isLoading = signal(false);
  isUploading = signal(false);
  isDeletingUuid = signal<string | null>(null);
  isLoadingPresigned = signal(false);
  tenantId = signal('');
  viewMode = signal<'grid' | 'list'>('grid');

  // Filters
  searchTerm = signal('');
  filterRefType = signal<FileReferenceType | ''>('');
  filterFileType = signal<FileType | ''>('');

  // Selections
  selectedFile = signal<FileRecordModel | null>(null);
  fileToDelete = signal<FileRecordModel | null>(null);
  presignedUrl = signal<string | null>(null);
  deleteMode = signal<'soft' | 'permanent'>('soft');

  // Upload
  uploadForm!: FormGroup;
  selectedUploadFile: File | null = null;
  uploadFileName = signal('');
  isDragOver = signal(false);

  // Computed filtered list
  filteredFiles = computed(() => {
    let list = this.files();
    const search = this.searchTerm().toLowerCase().trim();
    const refType = this.filterRefType();
    const fileType = this.filterFileType();

    if (search) {
      list = list.filter(f =>
        f.originalFileName.toLowerCase().includes(search) ||
        f.description?.toLowerCase().includes(search) ||
        f.tags?.toLowerCase().includes(search) ||
        f.referenceId?.toLowerCase().includes(search)
      );
    }
    if (refType) list = list.filter(f => f.referenceType === refType);
    if (fileType) list = list.filter(f => f.fileType === fileType);
    return list;
  });

  totalSizeDisplay = computed(() => {
    const bytes = this.filteredFiles().reduce((sum, f) => sum + (f.fileSizeBytes || 0), 0);
    return this.formatBytes(bytes);
  });

  constructor(
    private fileManagerSvc: FileManagerService,
    private authSvc: AuthService,
    private toastSvc: ToastService,
    private modalService: ModalService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.authSvc.currentUser$.subscribe(user => {
      if (user) {
        this.tenantId.set(user.tenantId.toString());
        this.loadFiles();
      }
    });
    this.initUploadForm();
  }

  private initUploadForm() {
    this.uploadForm = this.fb.group({
      referenceId: ['', Validators.required],
      referenceType: ['GENERAL', Validators.required],
      fileType: ['GENERAL_DOCUMENT', Validators.required],
      description: [''],
      tags: [''],
      isPublic: [false]
    });
  }

  // ── Data Loading ─────────────────────────────────────────────────────────

  loadFiles() {
    this.isLoading.set(true);
    this.fileManagerSvc.getFilesByTenant(
      this.tenantId(),
      this.filterFileType() || null,
      (res: any) => {
        this.files.set(Array.isArray(res) ? res : res.data || []);
        this.isLoading.set(false);
      },
      (_err: any) => {
        this.toastSvc.show('Failed to load files', 'error');
        this.isLoading.set(false);
      }
    );
  }

  // ── Upload ────────────────────────────────────────────────────────────────

  openUploadModal() {
    this.uploadForm.reset({ referenceType: 'GENERAL', fileType: 'GENERAL_DOCUMENT', isPublic: false });
    this.selectedUploadFile = null;
    this.uploadFileName.set('');
    this.modalService.openTemplate(this.uploadModalTemplate, null, 'lg');
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedUploadFile = input.files[0];
      this.uploadFileName.set(input.files[0].name);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave() {
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.selectedUploadFile = file;
      this.uploadFileName.set(file.name);
    }
  }

  onUpload() {
    if (this.uploadForm.invalid || !this.selectedUploadFile) return;
    const v = this.uploadForm.value;
    const formData = new FormData();
    formData.append('file', this.selectedUploadFile);
    formData.append('referenceId', v.referenceId);
    formData.append('referenceType', v.referenceType);
    formData.append('fileType', v.fileType);
    formData.append('tenantId', this.tenantId());
    if (v.description) formData.append('description', v.description);
    if (v.tags) formData.append('tags', v.tags);
    formData.append('isPublic', v.isPublic ? 'true' : 'false');

    this.isUploading.set(true);
    this.fileManagerSvc.uploadFile(
      formData,
      (_res: any) => {
        this.isUploading.set(false);
        this.toastSvc.show('File uploaded successfully', 'success');
        this.modalService.close();
        this.loadFiles();
      },
      (err: any) => {
        this.isUploading.set(false);
        this.toastSvc.show(err?.error?.message || 'Upload failed', 'error');
      }
    );
  }

  // ── Download ──────────────────────────────────────────────────────────────

  downloadFile(file: FileRecordModel) {
    this.fileManagerSvc.downloadFile(
      file.uuid,
      (res: any) => {
        const blob = res.body as Blob;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.originalFileName;
        link.click();
        window.URL.revokeObjectURL(url);
        this.toastSvc.show(`Downloading ${file.originalFileName}`, 'success');
      },
      (_err: any) => {
        this.toastSvc.show('Download failed', 'error');
      }
    );
  }

  // ── Presigned / Preview ───────────────────────────────────────────────────

  openPreview(file: FileRecordModel) {
    this.selectedFile.set(file);
    this.presignedUrl.set(null);
    this.isLoadingPresigned.set(true);
    this.modalService.openTemplate(this.previewModalTemplate, null, 'xl');

    this.fileManagerSvc.getPresignedUrl(
      file.uuid,
      60,
      (res: any) => {
        this.presignedUrl.set(res.url || res.data?.url);
        this.isLoadingPresigned.set(false);
      },
      (_err: any) => {
        this.isLoadingPresigned.set(false);
        this.toastSvc.show('Could not generate preview URL', 'error');
      }
    );
  }

  copyPresignedLink() {
    const url = this.presignedUrl();
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      this.toastSvc.show('Link copied to clipboard', 'success');
    });
  }

  openInNewTab() {
    const url = this.presignedUrl();
    if (url) window.open(url, '_blank');
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  openDeleteModal(file: FileRecordModel, mode: 'soft' | 'permanent' = 'soft') {
    this.fileToDelete.set(file);
    this.deleteMode.set(mode);
    this.modalService.openTemplate(this.deleteModalTemplate, null, 'sm');
  }

  confirmDelete() {
    const file = this.fileToDelete();
    if (!file) return;
    this.isDeletingUuid.set(file.uuid);
    const mode = this.deleteMode();

    const onSuccess = (_res: any) => {
      this.isDeletingUuid.set(null);
      this.toastSvc.show(
        mode === 'permanent' ? 'File permanently deleted' : 'File deleted',
        'success'
      );
      this.modalService.close();
      this.files.update(list => list.filter(f => f.uuid !== file.uuid));
    };

    const onError = (err: any) => {
      this.isDeletingUuid.set(null);
      this.toastSvc.show(err?.error?.message || 'Delete failed', 'error');
    };

    if (mode === 'permanent') {
      this.fileManagerSvc.permanentDeleteFile(file.uuid, onSuccess, onError);
    } else {
      this.fileManagerSvc.softDeleteFile(file.uuid, onSuccess, onError);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  closeModal() {
    this.modalService.close();
  }

  setViewMode(mode: 'grid' | 'list') {
    this.viewMode.set(mode);
  }

  onSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  clearFilters() {
    this.searchTerm.set('');
    this.filterRefType.set('');
    this.filterFileType.set('');
  }

  formatBytes(bytes: number): string {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  getFileIcon(mimeType: string): any {
    if (!mimeType) return this.FileIcon;
    if (mimeType.startsWith('image/')) return this.ImageIcon;
    if (mimeType === 'application/pdf') return this.FileTextIcon;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) return this.FileSpreadsheetIcon;
    return this.FileTextIcon;
  }

  getFileIconClass(mimeType: string): string {
    if (!mimeType) return 'text-gray-400';
    if (mimeType.startsWith('image/')) return 'text-emerald-500';
    if (mimeType === 'application/pdf') return 'text-red-500';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) return 'text-green-600';
    return 'text-blue-500';
  }

  getFileIconBg(mimeType: string): string {
    if (!mimeType) return 'bg-gray-50';
    if (mimeType.startsWith('image/')) return 'bg-emerald-50';
    if (mimeType === 'application/pdf') return 'bg-red-50';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) return 'bg-green-50';
    return 'bg-blue-50';
  }

  isImage(mimeType: string): boolean {
    return mimeType?.startsWith('image/') || false;
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm() || this.filterRefType() || this.filterFileType());
  }

  labelFor(value: string): string {
    return value.replace(/_/g, ' ');
  }
}
