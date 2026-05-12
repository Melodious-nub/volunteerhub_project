import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { CampaignService } from '../../core/services/campaign.service';
import { environment } from '../../../environments/environment';

interface ApiResponse {
  success: boolean;
  data: any;
  message?: string;
}

@Component({
  selector: 'app-ngo-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-layout min-h-screen bg-slate-50 flex">
      <!-- SIDEBAR -->
      <aside class="w-72 bg-slate-900 text-white flex flex-col shrink-0 transition-all duration-300 h-screen sticky top-0 overflow-y-auto custom-scrollbar">
        <div class="p-8">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">💚</div>
            <span class="text-xl font-display font-extrabold tracking-tight">Volunteer<span class="text-primary-400">Hub</span></span>
          </div>
        </div>

        <div class="px-6 py-4">
          <div class="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
            <div class="w-12 h-12 bg-gradient-to-br from-primary-400 to-accent-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {{ user()?.name?.charAt(0) || 'N' }}
            </div>
            <div class="overflow-hidden">
              <h4 class="font-bold text-sm truncate">{{ user()?.name }}</h4>
              <p class="text-[10px] text-primary-400 uppercase font-bold tracking-widest">NGO Organization</p>
            </div>
          </div>
        </div>

        <nav class="flex-1 px-4 py-6 space-y-2">
          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2">Overview</div>
          <a routerLink="/ngo" routerLinkActive="bg-primary-500 text-white shadow-lg shadow-primary-500/20" [routerLinkActiveOptions]="{exact: true}" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 text-slate-400 hover:text-white group">
            <i class="fas fa-tachometer-alt w-5 group-hover:scale-110 transition-transform"></i>
            <span class="font-bold text-sm">Dashboard</span>
          </a>
          
          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mt-6 mb-2">Campaigns</div>
          <a routerLink="/ngo/campaigns" routerLinkActive="bg-primary-500 text-white shadow-lg shadow-primary-500/20" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 text-slate-400 hover:text-white group">
            <i class="fas fa-bullhorn w-5 group-hover:scale-110 transition-transform"></i>
            <span class="font-bold text-sm">My Campaigns</span>
          </a>
          <a routerLink="/ngo/campaigns/create" routerLinkActive="bg-primary-500 text-white shadow-lg shadow-primary-500/20" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 text-slate-400 hover:text-white group">
            <i class="fas fa-plus-circle w-5 group-hover:scale-110 transition-transform"></i>
            <span class="font-bold text-sm">Create New</span>
          </a>

          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mt-6 mb-2">Analytics</div>
          <a routerLink="/ngo/reports" routerLinkActive="bg-primary-500 text-white shadow-lg shadow-primary-500/20" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 text-slate-400 hover:text-white group">
            <i class="fas fa-chart-bar w-5 group-hover:scale-110 transition-transform"></i>
            <span class="font-bold text-sm">Reports</span>
          </a>
        </nav>

        <div class="p-6">
          <button (click)="logout()" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 font-bold text-sm transition-all hover:bg-red-500 hover:text-white shadow-lg shadow-red-500/0 hover:shadow-red-500/20">
            <i class="fas fa-sign-out-alt"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <!-- MAIN CONTENT -->
      <main class="flex-1 flex flex-col h-screen overflow-y-auto relative">
        <!-- EMERGENCY BROADCAST BAR -->
        <div *ngIf="emergencyAlert()" class="bg-red-600 text-white px-8 py-3 flex items-center justify-between animate-pulse sticky top-0 z-[60]">
          <div class="flex items-center gap-4">
            <i class="fas fa-exclamation-triangle"></i>
            <span class="text-sm font-bold uppercase tracking-widest">Emergency Broadcast:</span>
            <span class="text-sm font-medium">{{ emergencyAlert()?.message }}</span>
          </div>
          <button (click)="dismissAlert()" class="text-white/80 hover:text-white"><i class="fas fa-times"></i></button>
        </div>

        <!-- TOPBAR -->
        <header class="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky z-50" [class.top-0]="!emergencyAlert()" [class.top-12]="emergencyAlert()">
          <div>
            <h2 class="text-xl font-display font-extrabold text-slate-900">NGO Dashboard</h2>
            <div class="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <a routerLink="/" class="hover:text-primary-500">Home</a>
              <i class="fas fa-chevron-right text-[8px]"></i>
              <span>Dashboard</span>
            </div>
          </div>

          <div class="flex items-center gap-6">
            <div class="relative group">
              <button class="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary-500 transition-colors bg-slate-50 rounded-xl relative">
                <i class="fas fa-bell text-lg"></i>
                <span *ngIf="unreadCount() > 0" class="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              
              <!-- Notifications Dropdown -->
              <div class="absolute right-0 top-full mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-4 z-[100]">
                <div class="flex items-center justify-between px-4 py-2 mb-4 border-b border-slate-50">
                  <span class="text-xs font-bold text-slate-900 uppercase tracking-widest">Notifications</span>
                  <span class="px-2 py-0.5 bg-primary-100 text-primary-600 rounded text-[9px] font-bold">{{ notifications().length }} Total</span>
                </div>
                <div class="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                  <div *ngFor="let note of notifications()" class="p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                    <p class="text-xs font-bold text-slate-900 mb-1" [class.text-red-600]="note.type === 'emergency'">{{ note.title }}</p>
                    <p class="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{{ note.message }}</p>
                    <span class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2 block">{{ note.createdAt | date:'shortTime' }} • {{ note.type }}</span>
                  </div>
                  <div *ngIf="notifications().length === 0" class="p-8 text-center text-slate-400 italic text-sm">
                    No new notifications.
                  </div>
                </div>
              </div>
            </div>
            
            <div class="w-px h-6 bg-slate-200"></div>
            <div class="flex items-center gap-3">
              <div class="text-right">
                <p class="text-sm font-bold text-slate-900">{{ user()?.name }}</p>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified NGO</p>
              </div>
              <div class="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 overflow-hidden">
                <i class="fas fa-user"></i>
              </div>
            </div>
          </div>
        </header>

        <!-- DASHBOARD CONTENT -->
        <div class="p-10 space-y-10">
          <!-- WELCOME -->
          <div class="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h1 class="text-3xl font-display font-extrabold text-slate-900 mb-2">Welcome back, {{ user()?.name }}! 🏢</h1>
              <p class="text-slate-500 font-medium">Manage your social impact, volunteers, and funding in one place.</p>
            </div>
            <a routerLink="/ngo/campaigns/create" class="px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-2xl shadow-xl shadow-primary-500/25 transition-all transform hover:-translate-y-1">
              <i class="fas fa-plus-circle mr-2"></i> Create Campaign
            </a>
          </div>

          <!-- STATS GRID -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div *ngFor="let stat of stats()" class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
              <div class="relative z-10 flex flex-col">
                <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-4 transition-all group-hover:scale-110 shadow-lg" [ngClass]="stat.bg">
                  <i [class]="stat.icon"></i>
                </div>
                <div class="text-3xl font-display font-extrabold text-slate-900 mb-1">{{ stat.value }}</div>
                <div class="text-xs font-bold text-slate-400 uppercase tracking-widest">{{ stat.label }}</div>
              </div>
              <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <i [class]="stat.icon + ' text-6xl'"></i>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- CAMPAIGN PERFORMANCE -->
            <div class="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div class="p-6 border-b border-slate-50 flex items-center justify-between">
                <h3 class="font-display font-bold text-slate-900">📢 Active Campaigns</h3>
                <a routerLink="/ngo/campaigns" class="text-sm font-bold text-primary-500 hover:underline">View All</a>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-left">
                  <thead class="bg-slate-50">
                    <tr>
                      <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Campaign Name</th>
                      <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</th>
                      <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Raised</th>
                      <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-50">
                    <tr *ngFor="let campaign of campaigns()" class="hover:bg-slate-50/50 transition-colors">
                      <td class="px-6 py-5">
                        <div class="font-bold text-slate-900 text-sm">{{ campaign.name }}</div>
                        <div class="text-[10px] text-slate-400 font-medium">{{ campaign.category }}</div>
                      </td>
                      <td class="px-6 py-5">
                        <div class="w-32">
                          <div class="flex items-center justify-between mb-1">
                            <span class="text-[10px] font-bold text-slate-500">{{ campaign.progress }}%</span>
                          </div>
                          <div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div class="h-full bg-primary-500 rounded-full" [style.width.%]="campaign.progress"></div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-5">
                        <div class="font-bold text-primary-500 text-sm">৳{{ campaign.raised }}</div>
                        <div class="text-[10px] text-slate-400 font-medium">Goal: ৳{{ campaign.goal }}</div>
                      </td>
                      <td class="px-6 py-5 text-center">
                        <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                               [ngClass]="campaign.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'">
                          {{ campaign.status }}
                        </span>
                      </td>
                    </tr>
                    <tr *ngIf="campaigns().length === 0">
                      <td colspan="4" class="px-6 py-10 text-center text-slate-400 italic">No campaigns found.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- RECENT DONATIONS -->
            <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div class="p-6 border-b border-slate-50 flex items-center justify-between">
                <h3 class="font-display font-bold text-slate-900">💚 Recent Donations</h3>
              </div>
              <div class="p-2 space-y-1">
                <div *ngFor="let donation of donations()" class="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors group">
                  <div class="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center font-bold text-white shadow-md transition-transform group-hover:scale-110">
                    {{ donation.campaign?.title?.charAt(0) || 'D' }}
                  </div>
                  <div class="flex-1">
                    <div class="font-bold text-slate-900 text-sm">৳{{ donation.amount?.toLocaleString() }}</div>
                    <div class="text-[10px] text-slate-400 font-medium truncate">{{ donation.campaign?.title }}</div>
                  </div>
                  <div class="text-[10px] font-medium text-slate-400">
                    {{ donation.createdAt | date:'shortTime' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .dashboard-layout { height: 100vh; overflow: hidden; }
  `]
})
export class NgoDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private campaignService = inject(CampaignService);
  private http = inject(HttpClient);
  private router = inject(Router);
  
  user = this.authService.currentUser;

  stats = signal([
    { label: 'Active Campaigns', value: '0', icon: 'fas fa-bullhorn', bg: 'bg-primary-100 text-primary-600' },
    { label: 'Total Raised', value: '৳0', icon: 'fas fa-coins', bg: 'bg-accent-100 text-accent-600' },
    { label: 'Active Volunteers', value: '0', icon: 'fas fa-users', bg: 'bg-orange-100 text-orange-600' },
    { label: 'Total Impact', value: '0', icon: 'fas fa-heart', bg: 'bg-red-100 text-red-600' }
  ]);

  campaigns = signal<any[]>([]);
  donations = signal<any[]>([]);
  notifications = signal<any[]>([]);
  unreadCount = signal(0);
  emergencyAlert = signal<any | null>(null);

  ngOnInit(): void {
    this.fetchDashboardData();
    this.fetchNotifications();
  }

  fetchNotifications() {
    this.http.get<any>(`${environment.apiUrl}/notifications`).subscribe((res: ApiResponse) => {
      if (res.success) {
        this.notifications.set(res.data);
        this.unreadCount.set(res.data.length);
        
        // Check for emergency alerts
        const emergency = res.data.find((n: any) => n.type === 'emergency');
        if (emergency) {
          this.emergencyAlert.set(emergency);
        }
      }
    });
  }

  dismissAlert() {
    this.emergencyAlert.set(null);
  }

  fetchDashboardData() {
    const userId = this.user()?.id;
    if (!userId) return;

    this.campaignService.getCampaigns({ ngo: userId }).subscribe((res: ApiResponse) => {
      if (res.success) {
        const camps = res.data;
        this.campaigns.set(camps.slice(0, 5).map((c: any) => ({
          name: c.title,
          category: c.category,
          progress: Math.min(Math.round((c.raisedAmount / c.goalAmount) * 100), 100) || 0,
          raised: c.raisedAmount.toLocaleString(),
          goal: c.goalAmount.toLocaleString(),
          status: c.status.charAt(0).toUpperCase() + c.status.slice(1)
        })));

        const activeCount = camps.filter((c: any) => c.status === 'active').length;
        const totalRaised = camps.reduce((acc: number, c: any) => acc + c.raisedAmount, 0);
        const totalVolunteers = camps.reduce((acc: number, c: any) => acc + (c.volunteersJoined?.length || 0), 0);

        this.stats.set([
          { label: 'Active Campaigns', value: activeCount.toString(), icon: 'fas fa-bullhorn', bg: 'bg-primary-100 text-primary-600' },
          { label: 'Total Raised', value: `৳${totalRaised.toLocaleString()}`, icon: 'fas fa-coins', bg: 'bg-accent-100 text-accent-600' },
          { label: 'Active Volunteers', value: totalVolunteers.toString(), icon: 'fas fa-users', bg: 'bg-orange-100 text-orange-600' },
          { label: 'Total Impact', value: (totalVolunteers * 5 + totalRaised / 100).toFixed(0), icon: 'fas fa-heart', bg: 'bg-red-100 text-red-600' }
        ]);
      }
    });

    this.campaignService.getNgoDonations().subscribe((res: ApiResponse) => {
      if (res.success) {
        this.donations.set(res.data.slice(0, 5));
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
