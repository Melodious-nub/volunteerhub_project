import { Routes } from '@angular/router';
import { NgoDashboardComponent } from './ngo-dashboard.component';
import { CampaignCreateComponent } from './campaign-create.component';

export const NGO_DASHBOARD_ROUTES: Routes = [
  { path: '', component: NgoDashboardComponent },
  { path: 'campaigns', loadComponent: () => import('./components/my-campaigns.component').then(m => m.MyCampaignsComponent) },
  { path: 'campaigns/create', component: CampaignCreateComponent },
  { path: 'reports', loadComponent: () => import('./components/reports.component').then(m => m.ReportsComponent) }
];
