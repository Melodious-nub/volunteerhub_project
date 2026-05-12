import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CampaignService, Campaign } from '../../core/services/campaign.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-wrapper overflow-x-hidden">
      <!-- HERO SECTION -->
      <section class="relative bg-slate-900 text-white pt-32 pb-40 overflow-hidden">
        <div class="container mx-auto px-6 relative z-10">
          <div class="max-w-4xl mx-auto text-center">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary-400 text-xs font-bold uppercase tracking-widest mb-8 animate-fade-in">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              Bangladesh's Premier Humanitarian Network
            </div>
            
            <h1 class="text-5xl md:text-8xl font-display font-extrabold leading-[1.1] mb-8 tracking-tight animate-slide-up">
              Every Action <br>
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-emerald-400 to-primary-500">Creates a Ripple</span>
            </h1>
            
            <p class="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-slide-up-delay">
              Join a movement of over 12,000 changemakers. Connect with verified NGOs, launch impactful missions, and transform communities across Bangladesh.
            </p>
            
            <div class="flex flex-wrap justify-center gap-6 animate-slide-up-delay-2">
              <a routerLink="/auth/register/volunteer" class="px-10 py-5 bg-primary-500 hover:bg-primary-600 text-white font-extrabold rounded-2xl transition-all transform hover:-translate-y-1 shadow-2xl shadow-primary-500/20 text-lg">
                Start Volunteering
              </a>
              <a routerLink="/campaigns" class="px-10 py-5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-extrabold rounded-2xl backdrop-blur-sm transition-all text-lg">
                Explore Missions
              </a>
            </div>
          </div>
        </div>
        
        <!-- Decorative Elements -->
        <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
        <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3"></div>
        
        <div class="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </section>

      <!-- STATS SECTION -->
      <section class="relative -mt-20 z-20 pb-20">
        <div class="container mx-auto px-6">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div *ngFor="let stat of stats()" class="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center group hover:-translate-y-2 transition-all duration-500">
              <div class="text-4xl md:text-5xl font-display font-extrabold text-slate-900 mb-3 group-hover:text-primary-500 transition-colors">{{ stat.value }}</div>
              <div class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- FEATURED CAMPAIGNS -->
      <section class="py-32 bg-slate-50">
        <div class="container mx-auto px-6">
          <div class="flex flex-wrap items-end justify-between gap-8 mb-20">
            <div class="max-w-2xl">
              <h2 class="text-[10px] font-bold text-primary-500 uppercase tracking-[0.3em] mb-4">Urgent Missions</h2>
              <h3 class="text-4xl md:text-5xl font-display font-bold text-slate-900 leading-tight">Missions that Need <br> Your Attention</h3>
            </div>
            <a routerLink="/campaigns" class="group flex items-center gap-3 text-sm font-bold text-slate-900 hover:text-primary-500 transition-all">
              See All Missions
              <span class="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-primary-500 group-hover:border-primary-500 group-hover:text-white transition-all">
                <i class="fas fa-arrow-right"></i>
              </span>
            </a>
          </div>

          <!-- Empty State -->
          <div *ngIf="featuredCampaigns().length === 0" class="py-24 text-center bg-white rounded-[3.5rem] border border-dashed border-slate-200 shadow-sm">
            <div class="text-7xl mb-8">🌱</div>
            <h3 class="text-3xl font-display font-bold text-slate-900 mb-4">New Seeds of Change are Being Sown</h3>
            <p class="text-slate-500 max-w-md mx-auto text-lg mb-10">We're currently verifying and preparing new impactful missions. Check back shortly to find your next cause.</p>
            <div class="flex justify-center items-center gap-8">
              <a routerLink="/auth/register/ngo" class="text-sm font-bold text-primary-500 hover:underline uppercase tracking-widest">Launch a Mission</a>
              <a routerLink="/contact" class="text-sm font-bold text-slate-400 hover:underline uppercase tracking-widest">Get Notified</a>
            </div>
          </div>

          <div *ngIf="featuredCampaigns().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div *ngFor="let c of featuredCampaigns()" class="bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group transform hover:-translate-y-3">
              <div class="relative h-64 overflow-hidden">
                <img [src]="c.image" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                <div class="absolute top-6 left-6">
                  <span class="px-4 py-1.5 bg-white/90 backdrop-blur text-[10px] font-bold rounded-full uppercase tracking-widest text-slate-900 shadow-xl">{{ c.category }}</span>
                </div>
                <div class="absolute bottom-6 left-6 flex items-center gap-2 text-white/90 text-[10px] font-bold uppercase tracking-widest">
                  <i class="fas fa-map-marker-alt text-primary-400"></i> {{ c.location }}
                </div>
              </div>
              <div class="p-10">
                <h4 class="text-2xl font-display font-bold text-slate-900 mb-4 group-hover:text-primary-500 transition-colors leading-tight">{{ c.title }}</h4>
                
                <div class="space-y-5">
                  <div class="flex items-center justify-between">
                    <div class="flex flex-col">
                      <span class="text-2xl font-display font-extrabold text-primary-600">৳{{ c.raisedAmount.toLocaleString() }}</span>
                      <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Funds Mobilized</span>
                    </div>
                    <div class="text-right">
                      <span class="text-xl font-display font-bold text-slate-900">{{ getPercent(c) }}%</span>
                      <div class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Completed</div>
                    </div>
                  </div>
                  <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full bg-primary-500 rounded-full shadow-[0_0_12px_rgba(34,197,94,0.4)]" [style.width.%]="getPercent(c)"></div>
                  </div>
                </div>

                <div class="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                      <i class="fas fa-users text-xs"></i>
                    </div>
                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{{ c.volunteersRequired }} Needed</span>
                  </div>
                  <a [routerLink]="['/campaigns', c._id]" class="text-[10px] font-extrabold text-primary-500 uppercase tracking-[0.2em] hover:text-primary-600">Details →</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA SECTION -->
      <section class="py-40 bg-slate-900 relative overflow-hidden text-center">
        <div class="container mx-auto px-6 relative z-10 text-white">
          <h2 class="text-4xl md:text-6xl font-display font-bold mb-8 leading-tight">Be the Catalyst <br> for <span class="text-primary-400 italic">Positive Change</span></h2>
          <p class="text-slate-400 mb-14 max-w-2xl mx-auto text-xl leading-relaxed">Whether you're an NGO looking to scale your impact or a volunteer ready to serve, your journey starts here.</p>
          <div class="flex justify-center gap-6 flex-wrap">
            <a routerLink="/auth/register/volunteer" class="px-12 py-5 bg-white text-slate-900 font-extrabold rounded-2xl shadow-2xl hover:bg-slate-50 transition-all transform hover:-translate-y-1">Start Volunteering</a>
            <a routerLink="/auth/register/ngo" class="px-12 py-5 bg-white/5 border border-white/20 text-white font-extrabold rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all">Register NGO</a>
          </div>
        </div>
        
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.1)_0%,transparent_70%)]"></div>
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-fade-in { animation: fadeIn 1s ease-out; }
    .animate-slide-up { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
    .animate-slide-up-delay { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both; }
    .animate-slide-up-delay-2 { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both; }
    
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { 
      from { opacity: 0; transform: translateY(30px); } 
      to { opacity: 1; transform: translateY(0); } 
    }
  `]
})
export class HomeComponent implements OnInit {
  private http = inject(HttpClient);
  campaignService = inject(CampaignService);

  stats = signal([
    { label: 'Volunteers', value: '0' },
    { label: 'Missions', value: '0' },
    { label: 'Impact Made', value: '৳0' },
    { label: 'NGO Partners', value: '0' }
  ]);

  featuredCampaigns = signal<Campaign[]>([]);

  ngOnInit(): void {
    this.fetchFeaturedCampaigns();
    this.fetchStats();
  }

  fetchStats() {
    this.http.get<any>(`${environment.apiUrl}/campaigns/stats`).subscribe(res => {
      if (res.success) {
        const d = res.data;
        this.stats.set([
          { label: 'Volunteers', value: d.totalVolunteers.toLocaleString() },
          { label: 'Missions', value: d.totalCampaigns.toLocaleString() },
          { label: 'Impact Made', value: `৳${(d.totalFundsRaised / 1000).toFixed(1)}K` },
          { label: 'NGO Partners', value: d.totalNgos.toLocaleString() }
        ]);
      }
    });
  }

  fetchFeaturedCampaigns() {
    this.campaignService.getCampaigns().subscribe({
      next: (res) => {
        this.featuredCampaigns.set((res.data || []).slice(0, 3));
      },
      error: () => {}
    });
  }

  getPercent(c: Campaign) {
    if (!c.goalAmount) return 0;
    return Math.min(100, Math.floor((c.raisedAmount / c.goalAmount) * 100));
  }
}
