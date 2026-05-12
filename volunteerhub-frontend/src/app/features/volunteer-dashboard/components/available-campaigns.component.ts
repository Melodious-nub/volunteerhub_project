import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CampaignService } from '../../../core/services/campaign.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-available-campaigns',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6 md:p-10 animate-in space-y-10">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 class="text-2xl md:text-3xl font-display font-extrabold text-slate-900 mb-2">Explore Missions 🌍</h1>
          <p class="text-slate-500 font-medium text-sm md:text-base">Find social initiatives where you can make a real difference.</p>
        </div>
        <div class="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <input type="text" placeholder="Search missions..." (input)="filterCampaigns($event)"
                 class="px-4 py-2 outline-none text-sm font-medium w-40 md:w-64 bg-transparent">
          <div class="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">
            <i class="fas fa-search"></i>
          </div>
        </div>
      </div>

      <!-- CAMPAIGN GRID -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div *ngFor="let camp of filteredCampaigns()" class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
          <!-- Image -->
          <div class="h-48 relative overflow-hidden shrink-0">
            <img [src]="camp.image || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop'" 
                 class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
            <div class="absolute top-4 left-4">
              <span class="px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-lg text-[10px] font-bold uppercase tracking-widest border border-white/30">
                {{ camp.category }}
              </span>
            </div>
          </div>

          <!-- Content -->
          <div class="p-8 flex-1 flex flex-col">
            <h3 class="text-lg font-display font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-1">{{ camp.title }}</h3>
            <p class="text-slate-500 text-xs mb-6 line-clamp-2 leading-relaxed flex-1">{{ camp.shortDescription || camp.description }}</p>
            
            <div class="space-y-4 mb-8">
              <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Raised</span>
                <span class="text-slate-900">৳{{ camp.raisedAmount.toLocaleString() }} / ৳{{ camp.goalAmount.toLocaleString() }}</span>
              </div>
              <div class="h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div class="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                     [style.width.%]="(camp.raisedAmount / camp.goalAmount) * 100"></div>
              </div>
            </div>

            <div class="flex items-center justify-between gap-4 pt-6 border-t border-slate-50 mt-auto">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[10px] border border-slate-100">🏢</div>
                <div class="min-w-0">
                  <p class="text-[10px] font-bold text-slate-900 truncate">{{ camp.ngo?.name }}</p>
                  <p class="text-[8px] text-slate-400 font-bold uppercase">{{ camp.location }}</p>
                </div>
              </div>
              <div class="flex gap-2 shrink-0">
                <a [routerLink]="['/campaigns', camp._id]" class="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-100">
                  <i class="fas fa-eye text-xs"></i>
                </a>
                <button (click)="joinMission(camp)" 
                        [disabled]="isJoined(camp)"
                        [class.bg-emerald-500]="!isJoined(camp)"
                        [class.bg-slate-100]="isJoined(camp)"
                        class="px-5 py-2 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:shadow-none disabled:text-slate-400">
                  {{ isJoined(camp) ? 'Joined' : 'Join Now' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="filteredCampaigns().length === 0" class="col-span-full py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
          <div class="text-5xl mb-6 opacity-30">🔍</div>
          <h3 class="text-xl font-display font-bold text-slate-900 mb-2">No missions found</h3>
          <p class="text-slate-500 text-sm">Try searching for a different keyword or category.</p>
        </div>
      </div>
    </div>
  `
})
export class AvailableCampaignsComponent implements OnInit {
  private campaignService = inject(CampaignService);
  private toastr = inject(ToastrService);
  
  campaigns = signal<any[]>([]);
  filteredCampaigns = signal<any[]>([]);
  joinedIds = signal<string[]>([]);

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    // Fetch all active campaigns
    this.campaignService.getCampaigns({ status: 'active' }).subscribe({
      next: (res) => {
        this.campaigns.set(res.data);
        this.filteredCampaigns.set(res.data);
      }
    });

    // Fetch joined campaigns to disable buttons
    this.campaignService.getJoinedCampaigns().subscribe({
      next: (res) => {
        this.joinedIds.set(res.data.map((c: any) => c._id));
      }
    });
  }

  filterCampaigns(event: any) {
    const term = event.target.value.toLowerCase();
    this.filteredCampaigns.set(
      this.campaigns().filter(c => 
        c.title.toLowerCase().includes(term) || 
        c.category.toLowerCase().includes(term) ||
        c.location.toLowerCase().includes(term)
      )
    );
  }

  isJoined(camp: any) {
    return this.joinedIds().includes(camp._id);
  }

  joinMission(camp: any) {
    this.campaignService.joinCampaign(camp._id).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Welcome aboard! You have joined the mission.');
          this.joinedIds.update(ids => [...ids, camp._id]);
        }
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'Failed to join mission');
      }
    });
  }
}
