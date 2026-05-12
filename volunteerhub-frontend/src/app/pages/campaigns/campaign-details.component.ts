import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CampaignService, Campaign } from '../../core/services/campaign.service';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-campaign-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page-wrapper min-h-screen bg-slate-50">
      <!-- HERO SECTION -->
      <div class="bg-slate-900 pt-32 pb-48 text-white relative overflow-hidden">
        <div class="container mx-auto px-6 relative z-10">
          <div class="flex flex-wrap items-center gap-4 mb-8 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-400">
            <a routerLink="/campaigns" class="hover:text-white transition-colors">Missions</a>
            <i class="fas fa-chevron-right text-[8px] text-slate-600"></i>
            <span class="text-slate-400">{{ campaign()?.category }}</span>
          </div>
          
          <div class="max-w-4xl">
            <h1 class="text-4xl md:text-6xl font-display font-extrabold mb-8 tracking-tight leading-tight animate-slide-up">
              {{ campaign()?.title || 'Loading Mission...' }}
            </h1>
            
            <div class="flex flex-wrap items-center gap-6 animate-slide-up-delay">
              <div class="flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white text-xs">🏢</div>
                <span class="text-xs font-bold text-slate-300 tracking-wide">{{ campaign()?.ngo?.name }}</span>
              </div>
              <div class="flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                <i class="fas fa-map-marker-alt text-primary-500"></i>
                <span class="text-xs font-bold text-slate-300 tracking-wide">{{ campaign()?.location }}</span>
              </div>
              <div class="flex items-center gap-2 px-4 py-1.5 bg-primary-500/10 border border-primary-500/20 text-primary-400 rounded-full text-[10px] font-bold uppercase tracking-widest">
                <span class="w-1.5 h-1.5 bg-primary-500 rounded-full animate-ping"></span>
                {{ campaign()?.status }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Decorative Elements -->
        <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
        <div class="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </div>

      <div class="container mx-auto px-6 -mt-32 relative z-20 pb-24">
        <div *ngIf="loading()" class="animate-pulse space-y-10">
          <div class="h-96 bg-white rounded-[3.5rem] shadow-sm border border-slate-100"></div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div class="lg:col-span-2 h-96 bg-white rounded-[3rem]"></div>
            <div class="h-96 bg-white rounded-[3rem]"></div>
          </div>
        </div>

        <div *ngIf="!loading() && campaign()" class="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <!-- MAIN CONTENT -->
          <div class="lg:col-span-2 space-y-10">
            <div class="bg-white rounded-[3.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100">
              <img [src]="campaign()?.image" 
                   class="w-full h-[500px] object-cover" 
                   alt="Mission Cover">
              
              <div class="p-12">
                <!-- Tabs -->
                <div class="flex gap-10 border-b border-slate-50 mb-10 overflow-x-auto custom-scrollbar whitespace-nowrap">
                  <button *ngFor="let tab of tabs" 
                          (click)="activeTab.set(tab)"
                          [ngClass]="activeTab() === tab ? 'text-primary-500 border-primary-500' : 'text-slate-400 border-transparent hover:text-slate-600'"
                          class="pb-6 px-2 text-xs font-bold uppercase tracking-[0.2em] border-b-2 transition-all">
                    {{ tab }}
                  </button>
                </div>

                <!-- Tab Content -->
                <div [ngSwitch]="activeTab()" class="min-h-[400px]">
                  <div *ngSwitchCase="'About'" class="animate-in space-y-8">
                    <div class="prose prose-slate max-w-none">
                      <p class="text-slate-600 leading-relaxed text-lg whitespace-pre-line">
                        {{ campaign()?.description }}
                      </p>
                    </div>
                  </div>

                  <div *ngSwitchCase="'Updates'" class="animate-in">
                    <div class="p-12 bg-slate-50 rounded-[2.5rem] border border-slate-100 text-center">
                      <div class="text-6xl mb-6">🔔</div>
                      <h4 class="text-xl font-display font-bold text-slate-900 mb-2">No updates recorded yet</h4>
                      <p class="text-slate-500 max-w-xs mx-auto">The mission organizer will post field updates and progress reports here.</p>
                    </div>
                  </div>

                  <div *ngSwitchCase="'Volunteers'" class="animate-in space-y-10">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div class="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 group hover:bg-white hover:shadow-xl transition-all duration-500">
                        <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-sm group-hover:bg-primary-500 group-hover:text-white transition-all">👥</div>
                        <div class="text-4xl font-display font-extrabold text-slate-900 mb-1">{{ campaign()?.volunteersJoined?.length }}</div>
                        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Responders</div>
                      </div>
                      <div class="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 group hover:bg-white hover:shadow-xl transition-all duration-500">
                        <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-sm group-hover:bg-accent-500 group-hover:text-white transition-all">🎯</div>
                        <div class="text-4xl font-display font-extrabold text-slate-900 mb-1">{{ campaign()?.volunteersRequired }}</div>
                        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Required Support</div>
                      </div>
                    </div>

                    <div *ngIf="user()?.role === 'volunteer'" class="bg-slate-900 p-12 rounded-[3rem] text-white flex flex-col md:flex-row items-center gap-8 justify-between relative overflow-hidden group">
                      <div class="relative z-10 text-center md:text-left">
                        <h4 class="text-2xl font-display font-bold mb-3">Ready to join the mission?</h4>
                        <p class="text-slate-400 max-w-sm">Deploy as a volunteer and contribute your skills directly on the field.</p>
                      </div>
                      <button (click)="joinAsVolunteer()" [disabled]="joining() || hasJoined()" 
                              class="relative z-10 px-12 py-5 bg-primary-500 hover:bg-primary-600 text-white font-extrabold rounded-2xl shadow-2xl shadow-primary-500/30 transition-all disabled:opacity-50">
                        {{ hasJoined() ? 'Mission Joined ✓' : (joining() ? 'Deploying...' : 'Join as Volunteer 🙋') }}
                      </button>
                      <div class="absolute right-0 top-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- SIDEBAR DONATION -->
          <div class="space-y-8 sticky top-32 animate-slide-up">
            <div class="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-10">
              <h3 class="text-3xl font-display font-bold text-slate-900">Empower this <span class="text-primary-500">Cause</span></h3>
              
              <div class="space-y-5">
                <div class="flex items-center justify-between">
                  <div class="flex flex-col">
                    <span class="text-2xl font-display font-extrabold text-primary-600">৳{{ campaign()?.raisedAmount?.toLocaleString() }}</span>
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Mobilized</span>
                  </div>
                  <div class="text-right">
                    <span class="text-xl font-display font-bold text-slate-900">{{ getPercent() }}%</span>
                    <div class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Target reached</div>
                  </div>
                </div>
                <div class="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-primary-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.4)]" [style.width.%]="getPercent()"></div>
                </div>
                <p class="text-[10px] font-bold text-slate-400 text-center uppercase tracking-[0.2em]">Goal: ৳{{ campaign()?.goalAmount?.toLocaleString() }}</p>
              </div>

              <div class="space-y-6">
                <label class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block">Contribution Amount</label>
                <div class="grid grid-cols-3 gap-3">
                  <button *ngFor="let amt of donationAmounts" 
                          (click)="setDonationAmount(amt)"
                          [ngClass]="donationAmount() === amt ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/30' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'"
                          class="py-4 rounded-2xl text-xs font-bold transition-all border border-transparent">
                    ৳{{ amt }}
                  </button>
                </div>
                <div class="relative group">
                  <span class="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                  <input type="number" [(ngModel)]="customAmount" (input)="onCustomAmountChange()" 
                         class="w-full pl-12 pr-6 py-5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none text-sm font-bold text-slate-900" 
                         placeholder="Custom Amount">
                </div>
              </div>

              <!-- Payment Methods -->
              <div class="space-y-6">
                <label class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block">Select Gateway</label>
                <div class="grid grid-cols-2 gap-3">
                  <button *ngFor="let method of paymentMethods" 
                          (click)="selectedMethod.set(method.id)"
                          [ngClass]="selectedMethod() === method.id ? 'bg-slate-900 text-white shadow-xl scale-[1.02]' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'"
                          class="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group overflow-hidden relative">
                    <img [src]="method.icon" class="w-7 h-7 object-contain relative z-10" [alt]="method.name">
                    <span class="text-[10px] font-bold relative z-10 uppercase tracking-widest">{{ method.name }}</span>
                    <div *ngIf="selectedMethod() === method.id" class="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800"></div>
                  </button>
                </div>
              </div>

              <button (click)="submitDonation()" [disabled]="donating() || !donationAmount() || !selectedMethod()" 
                      class="w-full py-6 bg-primary-500 hover:bg-primary-600 text-white font-extrabold rounded-2xl shadow-2xl shadow-primary-500/30 transition-all transform hover:-translate-y-1 disabled:opacity-50">
                {{ donating() ? 'Processing...' : 'Secure Donation' }}
              </button>
              
              <div class="flex items-center justify-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                <i class="fas fa-shield-alt text-primary-500"></i> Bank Grade Security
              </div>
            </div>

            <div class="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 text-center">
              <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Amplify the Mission</h4>
              <div class="flex justify-center gap-4">
                <button class="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all"><i class="fab fa-facebook-f"></i></button>
                <button class="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all"><i class="fab fa-twitter"></i></button>
                <button class="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all"><i class="fas fa-link"></i></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-in { animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
    .animate-slide-up { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
    .animate-slide-up-delay { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { 
      from { opacity: 0; transform: translateY(20px); } 
      to { opacity: 1; transform: translateY(0); } 
    }
  `]
})
export class CampaignDetailsComponent implements OnInit {
  route = inject(ActivatedRoute);
  campaignService = inject(CampaignService);
  authService = inject(AuthService);
  toastr = inject(ToastrService);
  
  campaign = signal<Campaign | null>(null);
  loading = signal(true);
  joining = signal(false);
  donating = signal(false);
  user = this.authService.currentUser;

  tabs = ['About', 'Updates', 'Volunteers'];
  activeTab = signal('About');

  donationAmounts = [100, 500, 1000, 2000, 5000, 10000];
  donationAmount = signal<number | null>(null);
  customAmount: number | null = null;
  
  paymentMethods = [
    { id: 'bkash', name: 'bKash', icon: 'https://seeklogo.com/images/B/bkash-logo-FBB258B90F-seeklogo.com.png' },
    { id: 'nagad', name: 'Nagad', icon: 'https://seeklogo.com/images/N/nagad-logo-7A70BB6604-seeklogo.com.png' },
    { id: 'rocket', name: 'Rocket', icon: 'https://seeklogo.com/images/D/dutch-bangla-rocket-logo-B4D1CC458D-seeklogo.com.png' },
    { id: 'card', name: 'Card', icon: 'https://cdn-icons-png.flaticon.com/512/6963/6963703.png' }
  ];
  selectedMethod = signal<string | null>(null);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.fetchCampaignDetails(params['id']);
      }
    });
  }

  fetchCampaignDetails(id: string) {
    this.loading.set(true);
    this.campaignService.getCampaignById(id).subscribe({
      next: (res) => {
        this.campaign.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastr.error('Failed to load campaign details');
      }
    });
  }

  getPercent() {
    const c = this.campaign();
    if (!c || !c.goalAmount) return 0;
    return Math.min(100, Math.floor((c.raisedAmount / c.goalAmount) * 100));
  }

  setDonationAmount(amt: number) {
    this.donationAmount.set(amt);
    this.customAmount = null;
  }

  onCustomAmountChange() {
    if (this.customAmount) {
      this.donationAmount.set(this.customAmount);
    }
  }

  hasJoined() {
    const c = this.campaign();
    const u = this.user();
    if (!c || !u) return false;
    return c.volunteersJoined?.includes(u.id);
  }

  submitDonation() {
    const amt = this.donationAmount();
    const c = this.campaign();
    const method = this.selectedMethod();
    if (!amt || !c || !method) return;

    this.donating.set(true);
    this.campaignService.donateToCampaign(c._id!, { 
      amount: amt,
      paymentMethod: method
    }).subscribe({
      next: () => {
        this.donating.set(false);
        this.toastr.success(`Thank you! ৳${amt} successfully donated via ${method.toUpperCase()}. 💚`);
        this.fetchCampaignDetails(c._id!); // Refresh stats
      },
      error: () => {
        this.donating.set(false);
        this.toastr.error('Donation failed. Please try again.');
      }
    });
  }

  joinAsVolunteer() {
    const c = this.campaign();
    if (!c) return;

    if (!this.user()) {
      this.toastr.info('Please login to join this mission');
      inject(Router).navigate(['/auth/login']);
      return;
    }

    this.joining.set(true);
    this.campaignService.joinCampaign(c._id!).subscribe({
      next: () => {
        this.joining.set(false);
        this.toastr.success('Welcome aboard! You have joined this mission. 🙌');
        this.fetchCampaignDetails(c._id!); // Refresh stats
      },
      error: (err) => {
        this.joining.set(false);
        this.toastr.error(err.error.message || 'Failed to join mission');
      }
    });
  }
}
