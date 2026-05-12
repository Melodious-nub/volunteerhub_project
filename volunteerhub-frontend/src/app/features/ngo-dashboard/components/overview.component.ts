import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { CampaignService } from '../../../core/services/campaign.service';
import { environment } from '../../../../environments/environment';

interface ApiResponse {
  success: boolean;
  data: any;
  message?: string;
}

@Component({
  selector: 'app-ngo-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6 md:p-10 space-y-10 animate-in">
      <div class="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h1 class="text-2xl md:text-3xl font-display font-extrabold text-slate-900 mb-2">Welcome back, {{ user()?.name }}! 🏢</h1>
          <p class="text-slate-500 font-medium text-sm md:text-base">Manage your social impact, volunteers, and funding in one place.</p>
        </div>
        <a routerLink="/ngo/campaigns/create" class="w-full sm:w-auto px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-2xl shadow-xl shadow-primary-500/25 transition-all text-center">
          <i class="fas fa-plus-circle mr-2"></i> Create Campaign
        </a>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div *ngFor="let stat of stats()" class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-lg transition-all flex flex-col justify-between h-full min-w-0">
          <div class="relative z-10 flex flex-col min-w-0 flex-1">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4 transition-all group-hover:scale-110 shadow-md shrink-0" [ngClass]="stat.bg">
              <i [class]="stat.icon"></i>
            </div>
            <div class="min-w-0 mt-auto">
              <div class="text-lg md:text-xl font-display font-black text-slate-900 mb-0.5 break-words leading-tight">{{ stat.value }}</div>
              <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NgoOverviewComponent implements OnInit {
  authService = inject(AuthService);
  private campaignService = inject(CampaignService);
  user = this.authService.currentUser;

  stats = signal([
    { label: 'Active Campaigns', value: '0', icon: 'fas fa-bullhorn', bg: 'bg-primary-100 text-primary-600' },
    { label: 'Total Raised', value: '৳0', icon: 'fas fa-coins', bg: 'bg-accent-100 text-accent-600' },
    { label: 'Active Volunteers', value: '0', icon: 'fas fa-users', bg: 'bg-orange-100 text-orange-600' },
    { label: 'Total Impact', value: '0', icon: 'fas fa-heart', bg: 'bg-red-100 text-red-600' }
  ]);

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  fetchDashboardData() {
    const userId = this.user()?.id;
    if (!userId) return;

    this.campaignService.getCampaigns({ ngo: userId }).subscribe((res: ApiResponse) => {
      if (res.success) {
        const camps = res.data;
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
  }
}
