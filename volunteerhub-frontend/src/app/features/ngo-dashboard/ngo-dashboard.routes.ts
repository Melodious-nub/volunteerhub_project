import { Routes } from '@angular/router';
import { NgoDashboardComponent } from './ngo-dashboard.component';
import { CampaignCreateComponent } from './campaign-create.component';
import { NgoOverviewComponent } from './components/overview.component';

export const NGO_DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: NgoDashboardComponent,
    children: [
      { 
        path: '', 
        component: NgoOverviewComponent
      },
      { 
        path: 'campaigns', 
        loadComponent: () => import('./components/my-campaigns.component').then(m => m.MyCampaignsComponent) 
      },
      { 
        path: 'campaigns/create', 
        component: CampaignCreateComponent 
      },
      { 
        path: 'campaigns/edit/:id', 
        component: CampaignCreateComponent 
      },
      { 
        path: 'volunteers', 
        loadComponent: () => import('./components/ngo-volunteers.component').then(m => m.NgoVolunteersComponent) 
      },
      { 
        path: 'reports', 
        loadComponent: () => import('./components/reports.component').then(m => m.ReportsComponent) 
      }
    ]
  }
];
