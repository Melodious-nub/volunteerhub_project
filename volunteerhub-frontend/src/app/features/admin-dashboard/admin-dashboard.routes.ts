import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard.component';

export const ADMIN_DASHBOARD_ROUTES: Routes = [
  { 
    path: '', 
    component: AdminDashboardComponent,
    children: [
      { 
        path: '', 
        loadComponent: () => import('./components/admin-overview.component').then(m => m.AdminOverviewComponent) 
      },
      { 
        path: 'ngos', 
        loadComponent: () => import('./components/ngo-list.component').then(m => m.NgoListComponent) 
      },
      { 
        path: 'volunteers', 
        loadComponent: () => import('./components/volunteer-list.component').then(m => m.VolunteerListComponent) 
      },
      { 
        path: 'campaigns', 
        loadComponent: () => import('./components/all-campaigns.component').then(m => m.AllCampaignsComponent) 
      },
      { 
        path: 'messages', 
        loadComponent: () => import('./components/message-list.component').then(m => m.MessageListComponent) 
      }
    ]
  }
];
