import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CampaignService } from '../../core/services/campaign.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-campaign-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  template: `
    <div class="dashboard-layout min-h-screen bg-slate-50 flex">
      <!-- SIDEBAR (Reuse same structure as dashboard for consistency) -->
      <aside class="w-72 bg-slate-900 text-white flex flex-col shrink-0">
        <div class="p-8">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">💚</div>
            <span class="text-xl font-display font-extrabold tracking-tight">Volunteer<span class="text-primary-400">Hub</span></span>
          </div>
        </div>
        <nav class="flex-1 px-4 py-6 space-y-2">
          <a routerLink="/ngo" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 text-slate-400 hover:text-white group">
            <i class="fas fa-tachometer-alt w-5"></i>
            <span class="font-bold text-sm">Dashboard</span>
          </a>
          <a routerLink="/ngo/campaigns" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 text-slate-400 hover:text-white group">
            <i class="fas fa-bullhorn w-5"></i>
            <span class="font-bold text-sm">My Campaigns</span>
          </a>
          <a routerLink="/ngo/campaigns/create" routerLinkActive="bg-primary-500 text-white shadow-lg" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 text-slate-400 hover:text-white group">
            <i class="fas fa-plus-circle w-5"></i>
            <span class="font-bold text-sm">Create New</span>
          </a>
        </nav>
      </aside>

      <!-- MAIN -->
      <main class="flex-1 flex flex-col h-screen overflow-y-auto">
        <header class="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-20">
          <div>
            <h2 class="text-xl font-display font-extrabold text-slate-900">Create Campaign</h2>
            <div class="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <a routerLink="/ngo" class="hover:text-primary-500">Dashboard</a>
              <i class="fas fa-chevron-right text-[8px]"></i>
              <span>Create New</span>
            </div>
          </div>
        </header>

        <div class="p-10 max-w-6xl mx-auto w-full">
          <div class="flex flex-wrap items-start justify-between gap-6 mb-10">
            <div>
              <h1 class="text-3xl font-display font-extrabold text-slate-900 mb-2">Launch New Campaign 🚀</h1>
              <p class="text-slate-500 font-medium">Inspire the community to support your cause with a detailed campaign.</p>
            </div>
            <div class="flex gap-4">
              <button class="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all">Save Draft</button>
              <a routerLink="/ngo/campaigns" class="px-6 py-3 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200 transition-all">Cancel</a>
            </div>
          </div>

          <!-- Step Progress -->
          <div class="flex items-center gap-2 p-2 bg-slate-200/50 rounded-2xl mb-10">
            <button *ngFor="let step of steps; let i = index" 
                    (click)="currentStep.set(i + 1)"
                    [disabled]="i + 1 > maxStepReached()"
                    [ngClass]="{
                      'bg-white text-primary-500 shadow-sm': currentStep() === i + 1,
                      'text-slate-500': currentStep() !== i + 1,
                      'text-green-600': i + 1 < currentStep()
                    }"
                    class="flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              <i [class]="step.icon"></i>
              <span class="hidden md:inline">{{ step.label }}</span>
              <i *ngIf="i + 1 < currentStep()" class="fas fa-check-circle ml-1"></i>
            </button>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <!-- FORM AREA -->
            <div class="lg:col-span-2">
              <form [formGroup]="campaignForm" (ngSubmit)="onSubmit()">
                <!-- STEP 1: BASIC INFO -->
                <div *ngIf="currentStep() === 1" class="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 space-y-6">
                  <div class="form-group">
                    <label class="text-sm font-bold text-slate-700 mb-2 block">Campaign Title <span class="text-red-500">*</span></label>
                    <input type="text" formControlName="title" class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary-500/10 outline-none text-sm font-medium" placeholder="e.g. Flood Relief — Sylhet 2024">
                  </div>
                  
                  <div class="grid grid-cols-2 gap-6">
                    <div class="form-group">
                      <label class="text-sm font-bold text-slate-700 mb-2 block">Category <span class="text-red-500">*</span></label>
                      <select formControlName="category" class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary-500/10 outline-none text-sm font-medium">
                        <option value="">Select Category</option>
                        <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="text-sm font-bold text-slate-700 mb-2 block">Location <span class="text-red-500">*</span></label>
                      <select formControlName="location" class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary-500/10 outline-none text-sm font-medium">
                        <option value="">Select District</option>
                        <option *ngFor="let loc of districts" [value]="loc">{{ loc }}</option>
                      </select>
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="text-sm font-bold text-slate-700 mb-2 block">Short Description</label>
                    <input type="text" formControlName="shortDescription" class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary-500/10 outline-none text-sm font-medium" placeholder="One-line summary for the cards">
                  </div>

                  <div class="form-group">
                    <label class="text-sm font-bold text-slate-700 mb-2 block">Detailed Description <span class="text-red-500">*</span></label>
                    <textarea formControlName="description" rows="6" class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary-500/10 outline-none text-sm font-medium" placeholder="Explain your mission and goals..."></textarea>
                  </div>

                  <div class="grid grid-cols-2 gap-6">
                    <div class="form-group">
                      <label class="text-sm font-bold text-slate-700 mb-2 block">Start Date</label>
                      <input type="date" formControlName="startDate" class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary-500/10 outline-none text-sm font-medium">
                    </div>
                    <div class="form-group">
                      <label class="text-sm font-bold text-slate-700 mb-2 block">End Date <span class="text-red-500">*</span></label>
                      <input type="date" formControlName="endDate" class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary-500/10 outline-none text-sm font-medium">
                    </div>
                  </div>

                  <div class="flex justify-end pt-6">
                    <button type="button" (click)="nextStep()" class="px-10 py-4 bg-primary-500 text-white font-bold rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-600 transition-all">Next: Funding <i class="fas fa-arrow-right ml-2"></i></button>
                  </div>
                </div>

                <!-- STEP 2: FUNDING -->
                <div *ngIf="currentStep() === 2" class="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 space-y-6">
                  <div class="form-group">
                    <label class="text-sm font-bold text-slate-700 mb-2 block">Fundraising Goal (৳)</label>
                    <div class="relative">
                      <span class="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                      <input type="number" formControlName="goalAmount" class="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary-500/10 outline-none text-sm font-bold text-primary-600" placeholder="e.g. 500000">
                    </div>
                    <p class="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Leave 0 if this is purely a volunteer mission</p>
                  </div>

                  <div class="form-group">
                    <label class="text-sm font-bold text-slate-700 mb-2 block">Budget Breakdown</label>
                    <textarea rows="4" class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary-500/10 outline-none text-sm font-medium" placeholder="Describe how funds will be used..."></textarea>
                  </div>

                  <div class="flex justify-between pt-6">
                    <button type="button" (click)="prevStep()" class="px-10 py-4 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 transition-all">Back</button>
                    <button type="button" (click)="nextStep()" class="px-10 py-4 bg-primary-500 text-white font-bold rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-600 transition-all">Next: Volunteers <i class="fas fa-arrow-right ml-2"></i></button>
                  </div>
                </div>

                <!-- STEP 3: VOLUNTEERS -->
                <div *ngIf="currentStep() === 3" class="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 space-y-6">
                  <div class="grid grid-cols-2 gap-6">
                    <div class="form-group">
                      <label class="text-sm font-bold text-slate-700 mb-2 block">Volunteers Needed</label>
                      <input type="number" formControlName="volunteersRequired" class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary-500/10 outline-none text-sm font-medium" placeholder="e.g. 20">
                    </div>
                    <div class="form-group">
                      <label class="text-sm font-bold text-slate-700 mb-2 block">Min. Age Requirement</label>
                      <input type="number" class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary-500/10 outline-none text-sm font-medium" value="18">
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="text-sm font-bold text-slate-700 mb-2 block">Required Skills</label>
                    <div class="flex flex-wrap gap-2">
                      <button type="button" *ngFor="let skill of availableSkills" 
                              (click)="toggleSkill(skill)"
                              [ngClass]="selectedSkills().includes(skill) ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-600'"
                              class="px-4 py-2 rounded-full text-xs font-bold transition-all">
                        {{ skill }}
                      </button>
                    </div>
                  </div>

                  <div class="flex justify-between pt-6">
                    <button type="button" (click)="prevStep()" class="px-10 py-4 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 transition-all">Back</button>
                    <button type="button" (click)="nextStep()" class="px-10 py-4 bg-primary-500 text-white font-bold rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-600 transition-all">Next: Media <i class="fas fa-arrow-right ml-2"></i></button>
                  </div>
                </div>

                <!-- STEP 4: MEDIA -->
                <div *ngIf="currentStep() === 4" class="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 space-y-8">
                  <div class="bg-blue-50 p-6 rounded-3xl flex gap-4 border border-blue-100 mb-6">
                    <span class="text-2xl">🖼️</span>
                    <p class="text-sm text-blue-900 font-medium leading-relaxed">
                      To keep our platform fast, we only support external image URLs. You can use free services like ImgBB or PostImage to host your photos.
                    </p>
                  </div>

                  <div class="form-group">
                    <label class="text-sm font-bold text-slate-700 mb-2 block">Campaign Cover Image URL <span class="text-red-500">*</span></label>
                    <input type="text" formControlName="image" class="w-full px-6 py-5 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary-500/10 outline-none text-sm font-medium" placeholder="https://i.ibb.co/example/campaign.jpg">
                    <p class="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Recommended size: 1200 x 630 pixels</p>
                  </div>

                  <div *ngIf="campaignForm.value.image" class="mt-8 rounded-[2rem] overflow-hidden border border-slate-200 shadow-lg animate-in">
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-2">Image Preview</p>
                    <img [src]="campaignForm.value.image" class="w-full h-48 object-cover" alt="Preview" (error)="campaignForm.patchValue({image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200'})">
                  </div>

                  <div class="flex justify-between pt-6">
                    <button type="button" (click)="prevStep()" class="px-10 py-4 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 transition-all">Back</button>
                    <button type="button" (click)="nextStep()" class="px-10 py-4 bg-primary-500 text-white font-bold rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-600 transition-all">Next: Review & Publish <i class="fas fa-check-circle ml-2"></i></button>
                  </div>
                </div>

                <!-- STEP 5: REVIEW -->
                <div *ngIf="currentStep() === 5" class="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 space-y-8">
                  <div class="bg-primary-50 p-6 rounded-3xl flex gap-4 border border-primary-100">
                    <span class="text-2xl">ℹ️</span>
                    <p class="text-sm text-primary-900 font-medium leading-relaxed">Your campaign looks great! Once published, it will be visible to all volunteers and potential donors on the platform.</p>
                  </div>

                  <div class="space-y-6">
                    <div class="grid grid-cols-2 gap-8">
                      <div>
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Campaign Title</p>
                        <p class="font-bold text-slate-900">{{ campaignForm.value.title || '—' }}</p>
                      </div>
                      <div>
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Category & Location</p>
                        <p class="font-bold text-slate-900">{{ campaignForm.value.category }} • {{ campaignForm.value.location }}</p>
                      </div>
                      <div>
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Fundraising Goal</p>
                        <p class="font-bold text-primary-500 text-xl">৳{{ (campaignForm.value.goalAmount || 0).toLocaleString() }}</p>
                      </div>
                      <div>
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Volunteer Target</p>
                        <p class="font-bold text-slate-900">{{ campaignForm.value.volunteersRequired || 0 }} People</p>
                      </div>
                    </div>
                  </div>

                  <div class="flex justify-between pt-10 border-t border-slate-100">
                    <button type="button" (click)="prevStep()" class="px-10 py-4 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 transition-all">Back</button>
                    <button type="submit" [disabled]="loading() || !campaignForm.valid" class="px-12 py-5 bg-accent-500 text-white font-bold rounded-2xl shadow-xl shadow-accent-500/25 hover:bg-accent-600 transition-all transform hover:-translate-y-1 disabled:opacity-50">
                      {{ loading() ? 'Publishing...' : '🚀 Publish Campaign Now' }}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <!-- SIDEBAR TIPS -->
            <div class="space-y-6 hidden lg:block">
              <div class="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <h4 class="font-display font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span class="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center text-sm">💡</span>
                  Tips for Success
                </h4>
                <div class="space-y-6">
                  <div class="flex gap-4">
                    <div class="text-xl">📸</div>
                    <div>
                      <h5 class="text-sm font-bold text-slate-900">High Quality Image</h5>
                      <p class="text-xs text-slate-400 leading-relaxed">Campaigns with clear, emotional photos raise 3x more funds.</p>
                    </div>
                  </div>
                  <div class="flex gap-4">
                    <div class="text-xl">✍️</div>
                    <div>
                      <h5 class="text-sm font-bold text-slate-900">Be Specific</h5>
                      <p class="text-xs text-slate-400 leading-relaxed">Detail exactly how the funds will be used for transparency.</p>
                    </div>
                  </div>
                  <div class="flex gap-4">
                    <div class="text-xl">📣</div>
                    <div>
                      <h5 class="text-sm font-bold text-slate-900">Share Updates</h5>
                      <p class="text-xs text-slate-400 leading-relaxed">Regular updates keep donors and volunteers engaged.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                <h4 class="font-display font-bold mb-4 relative z-10">Need Help?</h4>
                <p class="text-slate-400 text-xs mb-6 relative z-10 leading-relaxed">Our support team is here to help you set up your campaign and reach more people.</p>
                <button class="text-xs font-bold text-primary-400 hover:text-white transition-colors relative z-10">Contact NGO Support →</button>
                <div class="absolute -bottom-10 -right-10 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class CampaignCreateComponent implements OnInit {
  fb = inject(FormBuilder);
  campaignService = inject(CampaignService);
  authService = inject(AuthService);
  toastr = inject(ToastrService);
  router = inject(Router);

  currentStep = signal(1);
  maxStepReached = signal(1);
  loading = signal(false);

  steps = [
    { label: 'Basic Info', icon: 'fas fa-info-circle' },
    { label: 'Funding', icon: 'fas fa-dollar-sign' },
    { label: 'Volunteers', icon: 'fas fa-users' },
    { label: 'Media', icon: 'fas fa-image' },
    { label: 'Review', icon: 'fas fa-check-circle' }
  ];

  categories = ['Disaster Relief', 'Healthcare', 'Education', 'Environment', 'Food Security', 'Social Welfare', 'Others'];
  districts = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh', 'Nationwide'];
  availableSkills = ['🏥 First Aid', '🚗 Driving', '📣 Communication', '💻 IT/Tech', '🍳 Cooking', '🏗️ Construction', '📚 Teaching', '📦 Logistics'];
  selectedSkills = signal<string[]>([]);

  campaignForm: FormGroup;

  constructor() {
    const today = new Date().toISOString().split('T')[0];
    this.campaignForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      location: ['', Validators.required],
      shortDescription: [''],
      description: ['', [Validators.required, Validators.minLength(50)]],
      startDate: [today],
      endDate: ['', Validators.required],
      goalAmount: [0, [Validators.required, Validators.min(0)]],
      volunteersRequired: [0, [Validators.required, Validators.min(0)]],
      image: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.authService.currentUser()?.role !== 'ngo') {
      this.toastr.error('Only NGOs can create campaigns');
      this.router.navigate(['/']);
    }
  }

  nextStep() {
    if (this.currentStep() < 5) {
      this.currentStep.update(s => s + 1);
      if (this.currentStep() > this.maxStepReached()) {
        this.maxStepReached.set(this.currentStep());
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  toggleSkill(skill: string) {
    this.selectedSkills.update(skills => 
      skills.includes(skill) ? skills.filter(s => s !== skill) : [...skills, skill]
    );
  }

  onSubmit() {
    if (this.campaignForm.invalid) {
      this.toastr.error('Please fill in all required fields correctly');
      return;
    }

    this.loading.set(true);
    const currentUser = this.authService.currentUser();
    
    const campaignData = {
      ...this.campaignForm.value,
      ngo: currentUser?.id,
      volunteersJoined: [], // Initially empty
      status: 'active'
    };

    this.campaignService.createCampaign(campaignData).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toastr.success('Campaign published successfully!');
        this.router.navigate(['/ngo']);
      },
      error: (err) => {
        this.loading.set(false);
        this.toastr.error(err.error.message || 'Failed to publish campaign');
      }
    });
  }
}
