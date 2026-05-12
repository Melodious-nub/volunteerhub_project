import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './shared/layouts/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { 
        path: 'campaigns', 
        loadComponent: () => import('./pages/campaigns/campaigns.component').then(m => m.CampaignsComponent) 
      },
      { 
        path: 'campaigns/:id', 
        loadComponent: () => import('./pages/campaigns/campaign-details.component').then(m => m.CampaignDetailsComponent) 
      },
      { 
        path: 'emergency-sos', 
        loadComponent: () => import('./pages/emergency-sos/emergency-sos.component').then(m => m.EmergencySosComponent) 
      },
      { 
        path: 'about', 
        loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent) 
      },
      { 
        path: 'contact', 
        loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent) 
      },
      { 
        path: 'faq', 
        loadComponent: () => import('./pages/faq/faq.component').then(m => m.FaqComponent) 
      },
      {
        path: 'auth',
        children: [
          {
            path: 'login',
            loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
          },
          {
            path: 'register',
            children: [
              {
                path: 'volunteer',
                loadComponent: () => import('./features/auth/volunteer/volunteer-register.component').then(m => m.VolunteerRegisterComponent)
              },
              {
                path: 'ngo',
                loadComponent: () => import('./features/auth/ngo/ngo-register.component').then(m => m.NgoRegisterComponent)
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: 'volunteer',
    canActivate: [authGuard],
    data: { role: 'volunteer' },
    loadChildren: () => import('./features/volunteer-dashboard/volunteer-dashboard.routes').then(m => m.VOLUNTEER_DASHBOARD_ROUTES)
  },
  {
    path: 'ngo',
    canActivate: [authGuard],
    data: { role: 'ngo' },
    loadChildren: () => import('./features/ngo-dashboard/ngo-dashboard.routes').then(m => m.NGO_DASHBOARD_ROUTES)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { role: 'admin' },
    loadChildren: () => import('./features/admin-dashboard/admin-dashboard.routes').then(m => m.ADMIN_DASHBOARD_ROUTES)
  },
  { path: '**', redirectTo: '' }
];
