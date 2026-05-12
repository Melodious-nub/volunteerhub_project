import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CampaignService, Campaign } from '../../core/services/campaign.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-campaigns',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page-wrapper min-h-screen bg-slate-50">
      <!-- PAGE HEADER -->
      <div class="bg-slate-900 pt-32 pb-40 text-white relative overflow-hidden">
        <div class="container mx-auto px-6 relative z-10 text-center">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary-400 text-[10px] font-bold uppercase tracking-widest mb-6">
            Humanitarian Missions
          </div>
          <h1 class="text-4xl md:text-7xl font-display font-extrabold mb-8 tracking-tight">Active <span class="text-primary-500">Missions</span></h1>
          <p class="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Browse through hundreds of verified missions across Bangladesh. Join as a volunteer or contribute to make a difference.
          </p>
        </div>
        
        <!-- Decorative Elements -->
        <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        <div class="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"></div>
      </div>

      <div class="container mx-auto px-6 -mt-20 relative z-20 pb-24">
        <!-- Search & Filter Bar -->
        <div class="bg-white p-6 md:p-8 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 mb-16">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div class="lg:col-span-5 relative">
              <i class="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input type="text" 
                     [(ngModel)]="searchQuery" 
                     (input)="filterCampaigns()"
                     class="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none text-sm font-medium" 
                     placeholder="Search missions by name, location or category...">
            </div>
            
            <div class="lg:col-span-7 flex flex-wrap gap-2 justify-end">
              <button *ngFor="let cat of categories" 
                      (click)="setCategory(cat)"
                      [ngClass]="activeCategory() === cat ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'"
                      class="px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap">
                {{ cat }}
              </button>
            </div>
          </div>
        </div>

        <!-- Loading Skeleton -->
        <div *ngIf="loading()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <div *ngFor="let i of [1,2,3,4,5,6]" class="bg-white rounded-[3rem] overflow-hidden shadow-sm animate-pulse">
            <div class="h-64 bg-slate-100"></div>
            <div class="p-10 space-y-6">
              <div class="h-4 bg-slate-100 rounded w-1/4"></div>
              <div class="h-8 bg-slate-100 rounded w-3/4"></div>
              <div class="h-4 bg-slate-100 rounded w-full"></div>
              <div class="h-14 bg-slate-100 rounded w-full"></div>
            </div>
          </div>
        </div>

        <!-- Campaign Grid -->
        <div *ngIf="!loading() && filteredCampaigns().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <div *ngFor="let campaign of filteredCampaigns()" class="bg-white rounded-[3rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-2xl transition-all duration-500 group transform hover:-translate-y-3">
            <div class="relative h-64 overflow-hidden bg-slate-100">
              <img [src]="campaign.image" 
                   class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                   alt="Mission">
              <div class="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
              <div class="absolute top-6 left-6">
                <span class="px-4 py-1.5 bg-white/90 backdrop-blur text-[10px] font-bold rounded-full shadow-xl uppercase tracking-widest">
                  {{ campaign.category }}
                </span>
              </div>
              <div class="absolute bottom-6 left-6 flex items-center gap-2 text-white text-[10px] font-bold uppercase tracking-widest">
                <i class="fas fa-map-marker-alt text-primary-400"></i> {{ campaign.location }}
              </div>
            </div>
            
            <div class="p-10">
              <h3 class="text-2xl font-display font-bold text-slate-900 mb-4 leading-tight group-hover:text-primary-500 transition-colors">
                {{ campaign.title }}
              </h3>
              <p class="text-slate-500 text-sm mb-8 line-clamp-2 leading-relaxed">
                {{ campaign.description }}
              </p>
              
              <!-- Progress -->
              <div class="mb-8">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex flex-col">
                    <span class="text-xl font-display font-extrabold text-primary-600">৳{{ campaign.raisedAmount.toLocaleString() }}</span>
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Raised</span>
                  </div>
                  <div class="text-right">
                    <span class="text-lg font-display font-bold text-slate-900">{{ getPercent(campaign) }}%</span>
                    <div class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Goal Reached</div>
                  </div>
                </div>
                <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-primary-500 rounded-full shadow-[0_0_12px_rgba(34,197,94,0.3)]" [style.width.%]="getPercent(campaign)"></div>
                </div>
              </div>

              <div class="flex items-center justify-between pt-8 border-t border-slate-50">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                    <i class="fas fa-users text-xs"></i>
                  </div>
                  <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{{ campaign.volunteersRequired }} Needed</span>
                </div>
                <a [routerLink]="['/campaigns', campaign._id]" class="px-6 py-3 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-primary-500 transition-all shadow-lg hover:shadow-primary-500/25">
                  Details →
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading() && filteredCampaigns().length === 0" class="text-center py-32 bg-white rounded-[4rem] border-2 border-dashed border-slate-200">
          <div class="text-7xl mb-8">🔭</div>
          <h3 class="text-3xl font-display font-bold text-slate-900 mb-4">No matching missions found</h3>
          <p class="text-slate-500 max-w-md mx-auto text-lg mb-10">We couldn't find any missions matching your current filters. Try resetting or adjusting your search.</p>
          <button (click)="resetFilters()" class="px-10 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-primary-500 transition-all shadow-xl hover:shadow-primary-500/25">
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class CampaignsComponent implements OnInit {
  campaignService = inject(CampaignService);
  
  allCampaigns = signal<Campaign[]>([]);
  filteredCampaigns = signal<Campaign[]>([]);
  loading = signal(true);
  
  categories = ['All', 'Disaster Relief', 'Healthcare', 'Education', 'Environment', 'Food Security', 'Social Welfare'];
  activeCategory = signal('All');
  searchQuery = '';

  ngOnInit(): void {
    this.fetchCampaigns();
  }

  fetchCampaigns() {
    this.loading.set(true);
    this.campaignService.getCampaigns().subscribe({
      next: (res) => {
        this.allCampaigns.set(res.data || []);
        this.filterCampaigns();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.setMockData();
      }
    });
  }

  filterCampaigns() {
    let campaigns = this.allCampaigns();
    
    if (this.activeCategory() !== 'All') {
      campaigns = campaigns.filter(c => c.category === this.activeCategory());
    }
    
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      campaigns = campaigns.filter(c => 
        c.title.toLowerCase().includes(query) || 
        c.location.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query)
      );
    }
    
    this.filteredCampaigns.set(campaigns);
  }

  setCategory(cat: string) {
    this.activeCategory.set(cat);
    this.filterCampaigns();
  }

  resetFilters() {
    this.activeCategory.set('All');
    this.searchQuery = '';
    this.filterCampaigns();
  }

  getPercent(c: Campaign) {
    if (!c.goalAmount) return 0;
    return Math.min(100, Math.floor((c.raisedAmount / c.goalAmount) * 100));
  }

  private setMockData() {
    const mock: Campaign[] = [
      { _id: '1', title: 'Flood Relief — Sylhet 2024', category: 'Disaster Relief', location: 'Sylhet', description: 'Emergency aid for flood victims.', goalAmount: 500000, raisedAmount: 342000, status: 'active', volunteersRequired: 50, volunteersJoined: [], startDate: '', endDate: '', image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80' },
      { _id: '2', title: 'Winter Clothes Distribution', category: 'Social Welfare', location: 'Dhaka', description: 'Warm clothes for the needy.', goalAmount: 80000, raisedAmount: 61500, status: 'active', volunteersRequired: 20, volunteersJoined: [], startDate: '', endDate: '', image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80' },
      { _id: '3', title: 'Medical Camp in Rajshahi', category: 'Healthcare', location: 'Rajshahi', description: 'Free health checkups and medicine.', goalAmount: 200000, raisedAmount: 175000, status: 'active', volunteersRequired: 15, volunteersJoined: [], startDate: '', endDate: '', image: 'https://images.unsplash.com/photo-1576091160550-2173dad99988?w=800&q=80' }
    ];
    this.allCampaigns.set(mock);
    this.filterCampaigns();
  }
}
