import { Routes } from '@angular/router';
import { NgoLoginComponent } from './ngo-login.component';
import { NgoRegisterComponent } from './ngo-register.component';

export const NGO_AUTH_ROUTES: Routes = [
  { path: 'login', component: NgoLoginComponent },
  { path: 'register', component: NgoRegisterComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
