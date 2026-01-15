import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Crucial for ngModel
import { ToastService } from '../../../layouts/components/toast/toastService';
import { UserManagementService } from '../userManagement.service';
import { ApplicationModel, ModuleModel, PrivilegeModel } from '../models/application.model';

interface ApplicationUI extends ApplicationModel {
  isExpanded?: boolean;
  isLoadingModules?: boolean;
  modules?: ModuleUI[];
}

interface ModuleUI extends ModuleModel {
  isEditing?: boolean;
  newPrivilegeName?: string;
}

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './applications.component.html',
  styleUrl: './applications.component.css'
})
export class ApplicationsComponent implements OnInit {

  applications: ApplicationUI[] = [];
  isLoadingApps: boolean = false;
  isGlobalEditMode: boolean = false;

  constructor(
    private toast: ToastService,
    private userManagementService: UserManagementService
  ) { }

  ngOnInit() {
    this.loadApplications();
  }

  loadApplications() {
    this.isLoadingApps = true;
    this.userManagementService.getAllApplications(
      (res: any) => {
        this.applications = res.data.map((app: any) => ({
          ...app,
          isExpanded: false,
          isLoadingModules: false,
          modules: []
        }));
        this.isLoadingApps = false;
      },
      (err: any) => {
        this.isLoadingApps = false;
        this.toast.show('Failed to load applications', 'error');
      }
    );
  }

  // Lazy Load Modules
  toggleAppExpansion(app: ApplicationUI) {
    app.isExpanded = !app.isExpanded;

    if (app.isExpanded && (!app.modules || app.modules.length === 0)) {
      app.isLoadingModules = true;
      this.userManagementService.getModulesByApplication(app.id,
        (res: any) => {
          app.modules = res.data.map((m: any) => ({ ...m, isEditing: false, newPrivilegeName: '' }));
          app.isLoadingModules = false;
        },
        (err: any) => {
          app.isLoadingModules = false;
          app.isExpanded = false;
          this.toast.show(`Failed to load modules`, 'error');
        }
      );
    }
  }


  toggleGlobalEditMode() {
    this.isGlobalEditMode = !this.isGlobalEditMode;
  }

  createNewApplication() {
    // In a real scenario, this might open a small modal or add a blank row
    this.toast.show('Create Application Wizard would open here', 'info');
  }

  addModule(app: ApplicationUI) {
    if (!app.modules) app.modules = [];

    // Optimistic UI update
    app.modules.push({
      id: -1, // Temp ID
      moduleName: 'New Module',
      moduleKey: 'NEW_MODULE',
      description: '',
      isActive: true,
      privileges: [],
      isEditing: true // Auto-focus edit mode
    });
  }

  addPrivilege(module: ModuleUI) {
    if (!module.newPrivilegeName || module.newPrivilegeName.trim() === '') return;

    if (!module.privileges) module.privileges = [];

    module.privileges.push({
      id: -1,
      privilegeName: module.newPrivilegeName,
      privilegeKey: module.newPrivilegeName.toUpperCase().replace(/\s/g, '_'),
      description: ''
    });

    module.newPrivilegeName = '';
  }

  removePrivilege(module: ModuleUI, index: number) {
    module.privileges?.splice(index, 1);
  }

  saveChanges() {
    console.log('Saving full hierarchy:', this.applications);
    this.isGlobalEditMode = false;
    this.toast.show('Configuration saved successfully', 'success');
  }
}