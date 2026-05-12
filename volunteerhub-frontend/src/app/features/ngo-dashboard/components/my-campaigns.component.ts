import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CampaignService } from '../../../core/services/campaign.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-my-campaigns',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-10">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-display font-extrabold text-slate-900">My Campaigns</h1>
          <p class="text-slate-500 font-medium text-sm">Manage and track all your active and past social missions.</p>
        </div>
        <a routerLink="/ngo/campaigns/create" class="px-6 py-3 bg-primary-500 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all">
          <i class="fas fa-plus mr-2"></i> New Campaign
        </a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div *ngFor="let camp of campaigns()" class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all">
          <div class="h-48 relative overflow-hidden">
            <img [src]="camp.image" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Cover">
            <div class="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-bold uppercase tracking-widest text-primary-600 shadow-sm">
              {{ camp.status }}
            </div>
          </div>
          <div class="p-8">
            <h3 class="font-display font-bold text-slate-900 text-lg mb-2">{{ camp.title }}</h3>
            <div class="flex items-center gap-2 mb-6">
              <span class="px-2 py-0.5 bg-slate-100 text-slate-400 rounded text-[10px] font-bold uppercase tracking-widest">{{ camp.category }}</span>
              <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">•</span>
              <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{{ camp.location }}</span>
            </div>
            
            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1.5">
                  <span class="text-slate-400">Funding Progress</span>
                  <span class="text-primary-500">{{ getPercent(camp) }}%</span>
                </div>
                <div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-primary-500 rounded-full" [style.width.%]="getPercent(camp)"></div>
                </div>
              </div>
              
              <div class="flex justify-between border-t border-slate-50 pt-4">
                <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Raised</p>
                  <p class="text-sm font-bold text-slate-900">৳{{ camp.raisedAmount.toLocaleString() }}</p>
                </div>
                <div class="text-right">
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Goal</p>
                  <p class="text-sm font-bold text-slate-900">৳{{ camp.goalAmount.toLocaleString() }}</p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 mt-8">
              <button class="py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-200 transition-all">Edit</button>
              <button class="py-3 bg-primary-50 text-primary-600 font-bold rounded-xl text-xs hover:bg-primary-100 transition-all">View Analytics</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MyCampaignsComponent implements OnInit {
  private campaignService = inject(CampaignService);
  private authService = inject(AuthService);
  campaigns = signal<any[]>([]);

  ngOnInit() {
    const userId = this.authService.currentUser()?.id;
    if (userId) {
      this.campaignService.getCampaigns({ ngo: userId }).subscribe(res => {
        if (res.success) this.campaigns.set(res.data);
      });
    }
  }

  getPercent(camp: any) {
    return Math.min(Math.round((camp.raisedAmount / camp.goalAmount) * 100), 100) || 0;
  }
}
