import { Routes } from "@angular/router";
import { EmployeeManagementComponent } from "./employee-management.component";
import { EmployeeFormComponent } from "./employee-form/employee-form.component";
import { EmployeeComponent } from "./employee.component";

export const employeeManagementRoutes: Routes = [
  {
    path: '',
    component: EmployeeManagementComponent,
    children: [
      { path: '', component: EmployeeComponent },
      { path: 'create', component: EmployeeFormComponent },
      { path: 'edit/:id', component: EmployeeFormComponent },
      { path: '', redirectTo: 'employee', pathMatch: 'full' },
    ]
  }
];
