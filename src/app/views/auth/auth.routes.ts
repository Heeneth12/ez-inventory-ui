import { Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { OnboardingComponent } from './onboarding/onboarding.component';

export const AuthRoutes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: AuthComponent },
    { path: 'register', component: OnboardingComponent }
];
