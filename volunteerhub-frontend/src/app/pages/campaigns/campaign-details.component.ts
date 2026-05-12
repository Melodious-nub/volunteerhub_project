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
                          class="pb-6 px-2 text-xs font-bold uppercase tracking-[0.2em] border-b-2 transition-all relative">
                    {{ tab }}
                    <span *ngIf="tab === 'Updates' && campaign()?.updates?.length" class="ml-2 px-1.5 py-0.5 bg-primary-100 text-primary-600 rounded text-[8px] font-black">
                      {{ campaign()?.updates?.length }}
                    </span>
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

                  <div *ngSwitchCase="'Updates'" class="animate-in space-y-8">
                    <div *ngFor="let update of campaign()?.updates" class="relative pl-10 border-l-2 border-slate-100 pb-12 last:pb-0">
                      <div class="absolute -left-[11px] top-0 w-5 h-5 bg-primary-500 rounded-full border-4 border-white shadow-sm shadow-primary-500/30"></div>
                      <div class="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                          <h4 class="text-lg font-display font-black text-slate-900 uppercase tracking-tight">{{ update.title }}</h4>
                          <span class="px-4 py-1.5 bg-slate-50 text-slate-400 rounded-full text-[9px] font-bold uppercase tracking-widest border border-slate-100">
                            {{ update.date | date:'MMM d, y' }}
                          </span>
                        </div>
                        <p class="text-slate-600 leading-relaxed text-sm">{{ update.message }}</p>
                      </div>
                    </div>
                    
                    <div *ngIf="!campaign()?.updates?.length" class="p-12 bg-slate-50 rounded-[2.5rem] border border-slate-100 text-center">
                      <div class="text-6xl mb-6 grayscale opacity-20">🔔</div>
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

              <button (click)="openPaymentModal()" [disabled]="!donationAmount()" 
                      class="w-full py-6 bg-primary-500 hover:bg-primary-600 text-white font-extrabold rounded-2xl shadow-2xl shadow-primary-500/30 transition-all transform hover:-translate-y-1 disabled:opacity-50">
                <span>Secure Donation</span>
              </button>
              
              <div class="flex items-center justify-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                <i class="fas fa-shield-alt text-primary-500"></i> Bank Grade Security
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FAKE SSLCOMMERZ PAYMENT MODAL -->
      <div *ngIf="showPaymentModal()" class="fixed inset-0 z-[9999] overflow-y-auto custom-scrollbar">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" (click)="closePaymentModal()"></div>
        
        <!-- Modal Wrapper -->
        <div class="flex min-h-full items-center justify-center p-4 sm:p-6">
          <div class="relative bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-slide-up min-h-[550px]">
            
            <!-- Sidebar -->
            <div class="w-full md:w-64 bg-slate-50 border-r border-slate-100 flex flex-col shrink-0">
              <div class="p-6 border-b border-slate-100 flex items-center justify-between md:block">
                <div class="flex items-center gap-2 mb-0 md:mb-1">
                  <div class="w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-[8px] text-white font-bold">SSL</div>
                  <span class="text-[10px] font-black text-slate-900 tracking-tighter">COMMERZ</span>
                </div>
                <p class="text-[8px] text-slate-400 font-bold uppercase tracking-widest hidden md:block">Payment Gateway</p>
                <div class="md:hidden text-right">
                  <p class="text-[8px] font-bold uppercase text-slate-400 leading-none">Payable</p>
                  <p class="text-sm font-black text-blue-600 leading-none">৳{{ donationAmount()?.toLocaleString() }}</p>
                </div>
              </div>

              <div class="flex md:flex-col overflow-x-auto md:overflow-y-auto p-2 md:p-3 gap-1 md:gap-1.5 custom-scrollbar bg-slate-100/50">
                <button *ngFor="let cat of paymentCategories" 
                        (click)="activeCategory.set(cat.id)"
                        [ngClass]="activeCategory() === cat.id ? 'bg-white text-blue-600 shadow-sm border-slate-200' : 'text-slate-500 hover:bg-white/50 border-transparent'"
                        class="flex-1 md:flex-none flex items-center justify-center md:justify-start gap-3 px-4 py-3.5 rounded-xl transition-all border group whitespace-nowrap">
                  <i [class]="cat.icon" class="text-sm md:text-base group-hover:scale-110 transition-transform"></i>
                  <span class="text-[9px] md:text-[10px] font-black uppercase tracking-widest ml-2 hidden md:inline">{{ cat.name }}</span>
                </button>
              </div>

              <div class="hidden md:block mt-auto p-6 bg-slate-900 text-white">
                <p class="text-[8px] font-bold uppercase tracking-widest opacity-50 mb-1 leading-none">Total Payable</p>
                <h4 class="text-xl font-display font-black leading-none">৳{{ donationAmount()?.toLocaleString() }}</h4>
              </div>
            </div>

            <!-- Main Content Area -->
            <div class="flex-1 flex flex-col min-w-0 bg-white">
              <div class="h-16 px-6 md:px-8 border-b border-slate-50 flex items-center justify-between shrink-0">
                <h3 class="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">{{ paymentStep() === 'success' ? 'Payment Complete' : (paymentStep() === 'processing' ? 'Verifying...' : 'Select Method') }}</h3>
                <button (click)="closePaymentModal()" class="w-8 h-8 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-all">
                  <i class="fas fa-times text-xs"></i>
                </button>
              </div>

              <div class="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar relative">
                <div *ngIf="paymentStep() === 'selection'" class="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-5 animate-in">
                  <button *ngFor="let method of filteredMethods()" 
                          (click)="selectMethod(method)"
                          class="aspect-square bg-slate-50 rounded-[2rem] p-4 border border-transparent hover:border-blue-500 hover:bg-white hover:shadow-xl transition-all flex flex-col items-center justify-center gap-3 group">
                    <img [src]="method.icon" class="w-10 h-10 md:w-14 md:h-14 object-contain group-hover:scale-110 transition-transform" [alt]="method.name" onerror="this.src='https://cdn-icons-png.flaticon.com/512/6963/6963703.png'">
                    <span class="text-[8px] md:text-[9px] font-black text-slate-900 uppercase tracking-widest text-center">{{ method.name }}</span>
                  </button>
                </div>

                <div *ngIf="paymentStep() === 'input'" class="max-w-xs mx-auto space-y-6 md:space-y-8 animate-in text-center py-4">
                  <div>
                    <img [src]="selectedMethod()?.icon" class="h-12 md:h-14 mx-auto mb-4 object-contain" alt="Provider" onerror="this.src='https://cdn-icons-png.flaticon.com/512/6963/6963703.png'">
                    <h4 class="text-base md:text-lg font-display font-black text-slate-900">Payment via {{ selectedMethod()?.name }}</h4>
                  </div>
                  <div class="space-y-5 text-left">
                    <div class="space-y-1.5">
                      <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Account Number</label>
                      <input type="text" placeholder="01XXXXXXXXX" class="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none text-base font-black tracking-widest transition-all text-center">
                    </div>
                    <div class="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3 items-start">
                      <i class="fas fa-shield-check text-blue-600 mt-0.5"></i>
                      <p class="text-[9px] text-blue-700 font-bold uppercase tracking-widest leading-relaxed">System will send a secure OTP to verify ownership.</p>
                    </div>
                    <button (click)="startProcessing()" class="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-95">Proceed to Pay</button>
                  </div>
                </div>

                <div *ngIf="paymentStep() === 'processing'" class="absolute inset-0 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm z-20 animate-in p-10">
                  <div class="relative">
                    <div class="w-16 h-16 md:w-20 md:h-20 border-[3px] border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <div class="absolute inset-0 flex items-center justify-center"><i class="fas fa-lock text-xl text-blue-600"></i></div>
                  </div>
                  <h4 class="text-lg font-display font-black text-slate-900 mt-6 text-center">Verifying Transaction</h4>
                  <p class="text-[9px] text-slate-400 mt-2 uppercase font-bold tracking-[0.3em] text-center">Contacting {{ selectedMethod()?.name }} Gateway...</p>
                </div>

                <div *ngIf="paymentStep() === 'success'" class="absolute inset-0 flex flex-col items-center justify-center bg-white z-20 animate-in p-6 md:p-10">
                  <div class="w-16 h-16 md:w-20 md:h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/30 animate-bounce"><i class="fas fa-check"></i></div>
                  <h4 class="text-2xl md:text-3xl font-display font-black text-slate-900 mt-6">Success!</h4>
                  <p class="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest text-center">Your donation has been processed.</p>
                  <div class="mt-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 w-full max-w-xs space-y-4">
                    <div class="flex justify-between items-center"><span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Trx ID</span><span class="text-[10px] font-black text-slate-900">#{{ transactionId }}</span></div>
                    <div class="flex justify-between items-center"><span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Amount</span><span class="text-[10px] font-black text-emerald-600">৳{{ donationAmount()?.toLocaleString() }}</span></div>
                  </div>
                  <button (click)="finalSubmitDonation()" class="mt-8 px-10 py-4 bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[9px] rounded-2xl hover:bg-blue-600 transition-all shadow-xl active:scale-95">Finish & Close</button>
                </div>
              </div>

              <div class="h-14 px-6 md:px-8 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between shrink-0">
                <div class="flex items-center gap-3">
                  <img src="https://img.icons8.com/color/96/visa.png" class="h-4 md:h-5 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
                  <img src="https://img.icons8.com/color/96/mastercard.png" class="h-6 md:h-7 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
                </div>
                <div class="flex items-center gap-1.5 text-[7px] md:text-[8px] font-black text-slate-300 uppercase tracking-widest"><i class="fas fa-shield-alt text-blue-500"></i> SSL SECURE</div>
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
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .custom-scrollbar::-webkit-scrollbar { width: 3px; height: 3px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
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
  
  // Payment Modal Logic
  showPaymentModal = signal(false);
  paymentStep = signal<'selection' | 'input' | 'processing' | 'success'>('selection');
  activeCategory = signal('mobile');
  selectedMethod = signal<any | null>(null);
  transactionId = Math.random().toString(36).substring(2, 10).toUpperCase();

  paymentCategories = [
    { id: 'mobile', name: 'Mobile Banking', icon: 'fas fa-mobile-alt' },
    { id: 'card', name: 'Debit/Credit Cards', icon: 'fas fa-credit-card' },
    { id: 'net', name: 'Internet Banking', icon: 'fas fa-university' }
  ];

  allPaymentMethods = [
    { id: 'bkash', name: 'bKash', cat: 'mobile', icon: 'https://raw.githubusercontent.com/Shandeb/bangladesh-payment-gateways/master/images/bkash.png' },
    { id: 'nagad', name: 'Nagad', cat: 'mobile', icon: 'https://raw.githubusercontent.com/Shandeb/bangladesh-payment-gateways/master/images/nagad.png' },
    { id: 'rocket', name: 'Rocket', cat: 'mobile', icon: 'https://raw.githubusercontent.com/Shandeb/bangladesh-payment-gateways/master/images/rocket.png' },
    { id: 'upay', name: 'Upay', cat: 'mobile', icon: 'https://raw.githubusercontent.com/Shandeb/bangladesh-payment-gateways/master/images/upay.png' },
    { id: 'visa', name: 'Visa', cat: 'card', icon: 'https://raw.githubusercontent.com/Shandeb/bangladesh-payment-gateways/master/images/visa.png' },
    { id: 'master', name: 'Mastercard', cat: 'card', icon: 'https://raw.githubusercontent.com/Shandeb/bangladesh-payment-gateways/master/images/mastercard.png' },
    { id: 'dbbl', name: 'DBBL Nexus', cat: 'card', icon: 'https://raw.githubusercontent.com/Shandeb/bangladesh-payment-gateways/master/images/dbbl.png' },
    { id: 'city', name: 'City Bank', cat: 'net', icon: 'https://seeklogo.com/images/T/the-city-bank-ltd-logo-3EE154D495-seeklogo.com.png' },
    { id: 'islami', name: 'Islami Bank', cat: 'net', icon: 'https://seeklogo.com/images/I/islami-bank-bangladesh-ltd-logo-C727D9A4C0-seeklogo.com.png' }
  ];

  filteredMethods() {
    return this.allPaymentMethods.filter(m => m.cat === this.activeCategory());
  }

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

  openPaymentModal() {
    if (!this.donationAmount()) {
      this.toastr.warning('Please select or enter a donation amount');
      return;
    }
    this.showPaymentModal.set(true);
    this.paymentStep.set('selection');
    this.transactionId = Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  closePaymentModal() {
    this.showPaymentModal.set(false);
  }

  selectMethod(method: any) {
    this.selectedMethod.set(method);
    this.paymentStep.set('input');
  }

  startProcessing() {
    this.paymentStep.set('processing');
    setTimeout(() => {
      this.paymentStep.set('success');
    }, 2500);
  }

  finalSubmitDonation() {
    const amt = this.donationAmount();
    const c = this.campaign();
    const method = this.selectedMethod()?.id;
    if (!amt || !c || !method) return;

    this.donating.set(true);
    this.campaignService.donateToCampaign(c._id!, { 
      amount: amt,
      paymentMethod: method
    }).subscribe({
      next: () => {
        this.donating.set(false);
        this.showPaymentModal.set(false);
        this.toastr.success(`Thank you! ৳${amt} successfully donated. 💚`);
        this.fetchCampaignDetails(c._id!); // Refresh stats
      },
      error: () => {
        this.donating.set(false);
        this.toastr.error('Finalizing donation failed on server.');
      }
    });
  }

  hasJoined() {
    const c = this.campaign();
    const u = this.user();
    if (!c || !u) return false;
    return c.volunteersJoined?.includes(u.id);
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
        this.toastr.error(err.error?.message || 'Failed to join mission');
      }
    });
  }
}
