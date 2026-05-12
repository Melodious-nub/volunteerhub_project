import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CampaignService } from '../../../core/services/campaign.service';
import { VolunteerService } from '../../../core/services/volunteer.service';

@Component({
  selector: 'app-volunteer-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6 md:p-10 space-y-10 animate-in">
      <!-- WELCOME -->
      <div class="space-y-6">
        <div>
          <h1 class="text-2xl md:text-3xl font-display font-extrabold text-slate-900 mb-2">Good Day, {{ user()?.name }}! 👋</h1>
          <p class="text-slate-500 font-medium text-sm md:text-base">You are currently helping in <span class="text-primary-500 font-bold">{{ joinedCampaignsCount() }} campaigns</span>. Keep up the great work!</p>
        </div>
      </div>

      <!-- STATS GRID -->
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

      <!-- ROW 1: ACHIEVEMENTS & FINANCIAL IMPACT (Half and Half) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- RECENT ACHIEVEMENTS -->
        <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div class="p-8 border-b border-slate-50 flex items-center justify-between">
            <h3 class="font-display font-bold text-slate-900">🏆 Recent Achievements</h3>
            <a routerLink="/volunteer/certificates" class="text-[10px] font-bold text-primary-500 uppercase tracking-widest hover:underline">View All</a>
          </div>
          <div class="p-8 space-y-4 flex-1">
            <div *ngFor="let cert of recentCertificates()" class="flex items-center gap-5 p-5 bg-amber-50 rounded-[2rem] border border-amber-100 group hover:bg-white hover:border-amber-500/20 transition-all">
              <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">🎓</div>
              <div>
                <h4 class="font-bold text-amber-900 text-sm mb-0.5">{{ cert.name }}</h4>
                <p class="text-[10px] text-amber-700 font-medium uppercase tracking-widest">Awarded on {{ cert.issueDate | date:'longDate' }}</p>
              </div>
            </div>
            <div *ngIf="recentCertificates().length === 0" class="py-12 text-center flex flex-col items-center justify-center">
              <div class="text-4xl mb-4 opacity-20">📜</div>
              <p class="text-slate-400 italic text-xs font-medium">Complete missions to earn official recognition.</p>
            </div>
          </div>
        </div>

        <!-- FINANCIAL IMPACT (Professional Card) -->
        <div class="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group flex flex-col justify-center">
          <div class="relative z-10">
            <div class="w-12 h-12 bg-primary-500/20 rounded-2xl flex items-center justify-center text-primary-400 mb-8 border border-primary-500/20">
              <i class="fas fa-hand-holding-heart text-xl"></i>
            </div>
            <h3 class="font-display font-bold mb-3 text-[10px] uppercase tracking-[0.2em] text-primary-400">Financial Contribution</h3>
            <div class="text-4xl md:text-5xl font-display font-black mb-4 group-hover:scale-105 transition-transform origin-left tracking-tighter">
              ৳{{ totalDonated().toLocaleString() }}
            </div>
            <p class="text-xs text-slate-400 leading-relaxed max-w-sm font-medium">
              Your generosity has powered critical social missions across the country. Every contribution creates a ripple of positive change.
            </p>
          </div>
          <!-- Abstract Background Element -->
          <div class="absolute -bottom-10 -right-10 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px]"></div>
          <div class="absolute top-10 right-10 w-20 h-20 border-t-2 border-r-2 border-white/5 rounded-tr-[2rem]"></div>
        </div>

      </div>

      <!-- ROW 2: JOINED CAMPAIGNS (FULL WIDTH) -->
      <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div class="p-8 border-b border-slate-50 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
              <i class="fas fa-bullhorn"></i>
            </div>
            <div>
              <h3 class="font-display font-bold text-slate-900 leading-none mb-1">My Joined Campaigns</h3>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Missions you are currently supporting</p>
            </div>
          </div>
          <a routerLink="/campaigns" class="px-6 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all shadow-sm">Explore More</a>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-slate-50/50">
              <tr>
                <th class="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Social Mission</th>
                <th class="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Organization</th>
                <th class="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                <th class="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr *ngFor="let camp of joinedCampaigns()" class="hover:bg-slate-50/50 transition-colors group">
                <td class="px-8 py-6">
                  <div class="font-bold text-slate-900 text-sm group-hover:text-primary-500 transition-colors">{{ camp.title }}</div>
                  <div class="text-[10px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                    <i class="fas fa-map-marker-alt text-[8px]"></i>
                    {{ camp.location }}
                  </div>
                </td>
                <td class="px-8 py-6">
                  <div class="flex items-center gap-3">
                    <div class="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-400">{{ camp.ngo?.name?.charAt(0) }}</div>
                    <span class="text-xs font-bold text-slate-600">{{ camp.ngo?.name }}</span>
                  </div>
                </td>
                <td class="px-8 py-6">
                  <span class="px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-primary-500/10">{{ camp.category }}</span>
                </td>
                <td class="px-8 py-6 text-right">
                  <a [routerLink]="['/campaigns', camp._id]" class="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-primary-500 transition-all shadow-sm">Mission Hub</a>
                </td>
              </tr>
              <tr *ngIf="joinedCampaigns().length === 0">
                <td colspan="4" class="px-8 py-20 text-center flex flex-col items-center justify-center">
                  <div class="text-4xl mb-4 opacity-20">🏜️</div>
                  <p class="text-slate-400 italic text-sm font-medium max-w-xs">You haven't joined any campaigns yet. Start your journey by joining a mission today!</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class VolunteerOverviewComponent implements OnInit {
  authService = inject(AuthService);
  private campaignService = inject(CampaignService);
  private volunteerService = inject(VolunteerService);
  user = this.authService.currentUser;

  stats = signal([
    { label: 'Tasks Completed', value: '0', icon: 'fas fa-check-circle', bg: 'bg-primary-100 text-primary-600' },
    { label: 'Volunteer Hours', value: '0h', icon: 'fas fa-clock', bg: 'bg-accent-100 text-accent-600' },
    { label: 'Points Earned', value: '0', icon: 'fas fa-star', bg: 'bg-orange-100 text-orange-600' },
    { label: 'Certificates', value: '0', icon: 'fas fa-certificate', bg: 'bg-red-100 text-red-600' }
  ]);

  joinedCampaigns = signal<any[]>([]);
  joinedCampaignsCount = signal(0);
  totalDonated = signal(0);
  recentCertificates = signal<any[]>([]);

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    this.volunteerService.getStats().subscribe({
      next: (res) => {
        const s = res.data;
        this.stats.set([
          { label: 'Tasks Completed', value: s.tasksCompleted.toString(), icon: 'fas fa-check-circle', bg: 'bg-primary-100 text-primary-600' },
          { label: 'Volunteer Hours', value: s.volunteerHours.toString() + 'h', icon: 'fas fa-clock', bg: 'bg-accent-100 text-accent-600' },
          { label: 'Points Earned', value: s.pointsEarned.toLocaleString(), icon: 'fas fa-star', bg: 'bg-orange-100 text-orange-600' },
          { label: 'Certificates', value: s.certificates.toString(), icon: 'fas fa-certificate', bg: 'bg-red-100 text-red-600' }
        ]);
        this.joinedCampaignsCount.set(s.joinedCampaignsCount);
        this.totalDonated.set(s.totalDonated);
      }
    });

    this.campaignService.getJoinedCampaigns().subscribe({
      next: (res) => {
        this.joinedCampaigns.set(res.data.slice(0, 5));
      }
    });

    this.volunteerService.getCertificates().subscribe({
      next: (res) => {
        this.recentCertificates.set(res.data.slice(0, 2));
      }
    });
  }
}
