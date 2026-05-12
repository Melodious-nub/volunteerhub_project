import { Routes } from '@angular/router';
import { VolunteerDashboardComponent } from './volunteer-dashboard.component';
import { VolunteerOverviewComponent } from './components/volunteer-overview.component';

export const VOLUNTEER_DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: VolunteerDashboardComponent,
    children: [
      { path: '', component: VolunteerOverviewComponent },
      { path: 'explore', loadComponent: () => import('./components/available-campaigns.component').then(m => m.AvailableCampaignsComponent) },
      { path: 'tasks', loadComponent: () => import('./components/volunteer-tasks.component').then(m => m.VolunteerTasksComponent) },
      { path: 'history', loadComponent: () => import('./components/activity-history.component').then(m => m.ActivityHistoryComponent) },
      { path: 'certificates', loadComponent: () => import('./components/certificates.component').then(m => m.CertificatesComponent) }
    ]
  }
];
