import { Routes } from '@angular/router';
import { VolunteerLoginComponent } from './volunteer-login.component';
import { VolunteerRegisterComponent } from './volunteer-register.component';

export const VOLUNTEER_AUTH_ROUTES: Routes = [
  { path: 'login', component: VolunteerLoginComponent },
  { path: 'register', component: VolunteerRegisterComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
