import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { CampaignService } from '../../core/services/campaign.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-campaign-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  template: `
    <div class="p-6 md:p-10 max-w-6xl mx-auto w-full animate-in">
      <!-- HEADER -->
      <div class="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
        <div>
          <h1 class="text-2xl md:text-3xl font-display font-extrabold text-slate-900 mb-2">
            {{ isEditMode() ? 'Edit Campaign ✏️' : 'Launch New Campaign 🚀' }}
          </h1>
          <p class="text-slate-500 font-medium text-sm md:text-base">Inspire the community to support your cause with a detailed mission.</p>
        </div>
        <div class="flex gap-4 w-full md:w-auto">
          <a routerLink="/ngo/campaigns" class="flex-1 md:flex-none px-6 py-3 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200 transition-all text-center text-sm">Cancel</a>
          <button type="submit" form="campaignForm" [disabled]="loading()" 
                  class="flex-[2] md:flex-none px-8 py-3 bg-primary-500 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all text-sm disabled:opacity-50">
            {{ loading() ? (isEditMode() ? 'Updating...' : 'Publishing...') : (isEditMode() ? 'Update Mission' : 'Publish Mission') }}
          </button>
        </div>
      </div>

      <!-- Step Progress -->
      <div class="flex items-center gap-2 p-2 bg-slate-200/50 rounded-2xl mb-10 overflow-x-auto custom-scrollbar">
        <button *ngFor="let step of steps; let i = index" 
                (click)="goToStep(i + 1)"
                [ngClass]="{
                  'bg-white text-primary-500 shadow-sm': currentStep() === i + 1,
                  'text-slate-500': currentStep() !== i + 1,
                  'text-emerald-600': i + 1 < currentStep()
                }"
                class="flex-1 min-w-[120px] py-3 px-4 rounded-xl text-[10px] md:text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0">
          <i [class]="step.icon"></i>
          <span>{{ step.label }}</span>
          <i *ngIf="i + 1 < currentStep()" class="fas fa-check-circle ml-1"></i>
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <!-- FORM AREA -->
        <div class="lg:col-span-2">
          <form id="campaignForm" [formGroup]="campaignForm" (ngSubmit)="onSubmit()">
            
            <!-- STEP 1: BASIC INFO -->
            <div *ngIf="currentStep() === 1" class="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100 space-y-6 animate-fade-in">
              <div class="form-group">
                <label class="text-sm font-bold text-slate-700 mb-2 block px-1">Campaign Title <span class="text-red-500">*</span></label>
                <input type="text" formControlName="title" 
                       [class.ring-red-500]="isInvalid('title')"
                       class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary-500/10 outline-none text-sm font-medium" 
                       placeholder="e.g. Food Distribution Sylhet">
                <p *ngIf="isInvalid('title')" class="text-[10px] text-red-500 mt-2 font-bold uppercase tracking-widest px-1">Title is too short (min 10 chars)</p>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="form-group">
                  <label class="text-sm font-bold text-slate-700 mb-2 block px-1">Category <span class="text-red-500">*</span></label>
                  <select formControlName="category" 
                          [class.ring-red-500]="isInvalid('category')"
                          class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary-500/10 outline-none text-sm font-medium">
                    <option value="">Select Category</option>
                    <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="text-sm font-bold text-slate-700 mb-2 block px-1">Location <span class="text-red-500">*</span></label>
                  <select formControlName="location" 
                          [class.ring-red-500]="isInvalid('location')"
                          class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary-500/10 outline-none text-sm font-medium">
                    <option value="">Select District</option>
                    <option *ngFor="let loc of districts" [value]="loc">{{ loc }}</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="text-sm font-bold text-slate-700 mb-2 block px-1">Detailed Description <span class="text-red-500">*</span></label>
                <textarea formControlName="description" rows="6" 
                          [class.ring-red-500]="isInvalid('description')"
                          class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary-500/10 outline-none text-sm font-medium resize-none" 
                          placeholder="Explain your mission and goals..."></textarea>
                <p *ngIf="isInvalid('description')" class="text-[10px] text-red-500 mt-2 font-bold uppercase tracking-widest px-1">Description is too short (min 50 chars)</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="form-group">
                  <label class="text-sm font-bold text-slate-700 mb-2 block px-1">End Date <span class="text-red-500">*</span></label>
                  <input type="date" formControlName="endDate" 
                         [class.ring-red-500]="isInvalid('endDate')"
                         class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary-500/10 outline-none text-sm font-medium">
                </div>
              </div>

              <div class="flex justify-end pt-6">
                <button type="button" (click)="nextStep()" class="w-full md:w-auto px-10 py-4 bg-primary-500 text-white font-bold rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-600 transition-all">Next: Funding <i class="fas fa-arrow-right ml-2"></i></button>
              </div>
            </div>

            <!-- STEP 2: FUNDING -->
            <div *ngIf="currentStep() === 2" class="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100 space-y-6 animate-fade-in">
              <div class="form-group">
                <label class="text-sm font-bold text-slate-700 mb-2 block px-1">Fundraising Goal (৳)</label>
                <div class="relative">
                  <span class="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                  <input type="number" formControlName="goalAmount" class="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary-500/10 outline-none text-sm font-bold text-primary-600" placeholder="e.g. 500000">
                </div>
                <p class="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest px-1">Leave 0 if this is purely a volunteer mission</p>
              </div>

              <div class="flex justify-between pt-6 gap-4">
                <button type="button" (click)="prevStep()" class="flex-1 md:flex-none px-10 py-4 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 transition-all">Back</button>
                <button type="button" (click)="nextStep()" class="flex-1 md:flex-none px-10 py-4 bg-primary-500 text-white font-bold rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-600 transition-all">Next Step <i class="fas fa-arrow-right ml-2"></i></button>
              </div>
            </div>

            <!-- STEP 3: VOLUNTEERS -->
            <div *ngIf="currentStep() === 3" class="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100 space-y-6 animate-fade-in">
              <div class="form-group">
                <label class="text-sm font-bold text-slate-700 mb-2 block px-1">Volunteers Needed</label>
                <input type="number" formControlName="volunteersRequired" class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary-500/10 outline-none text-sm font-medium" placeholder="e.g. 20">
              </div>

              <div class="flex justify-between pt-6 gap-4">
                <button type="button" (click)="prevStep()" class="flex-1 md:flex-none px-10 py-4 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 transition-all">Back</button>
                <button type="button" (click)="nextStep()" class="flex-1 md:flex-none px-10 py-4 bg-primary-500 text-white font-bold rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-600 transition-all">Next Step <i class="fas fa-arrow-right ml-2"></i></button>
              </div>
            </div>

            <!-- STEP 4: MEDIA -->
            <div *ngIf="currentStep() === 4" class="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100 space-y-8 animate-fade-in">
              <div class="form-group">
                <label class="text-sm font-bold text-slate-700 mb-2 block px-1">Cover Image URL <span class="text-red-500">*</span></label>
                <input type="text" formControlName="image" 
                       [class.ring-red-500]="isInvalid('image')"
                       class="w-full px-6 py-5 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary-500/10 outline-none text-sm font-medium" placeholder="https://example.com/image.jpg">
              </div>

              <div *ngIf="campaignForm.value.image" class="rounded-[2rem] overflow-hidden border border-slate-200 shadow-lg animate-in">
                <img [src]="campaignForm.value.image" class="w-full h-48 object-cover" alt="Preview" 
                     (error)="$event.target.src = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200'">
              </div>

              <div class="flex justify-between pt-6 gap-4">
                <button type="button" (click)="prevStep()" class="flex-1 md:flex-none px-10 py-4 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 transition-all">Back</button>
                <button type="button" (click)="nextStep()" class="flex-1 md:flex-none px-10 py-4 bg-primary-500 text-white font-bold rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-600 transition-all">Review Mission <i class="fas fa-arrow-right ml-2"></i></button>
              </div>
            </div>

            <!-- STEP 5: REVIEW -->
            <div *ngIf="currentStep() === 5" class="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100 space-y-8 animate-fade-in">
              <div *ngIf="campaignForm.invalid" class="bg-red-50 border border-red-100 p-6 rounded-3xl mb-6">
                <div class="flex gap-3 text-red-600">
                  <i class="fas fa-exclamation-circle mt-1"></i>
                  <div>
                    <p class="text-sm font-bold">Please complete all required fields:</p>
                    <ul class="text-xs font-medium list-disc list-inside mt-2 space-y-1">
                      <li *ngIf="campaignForm.get('title')?.invalid">Title (min 10 chars)</li>
                      <li *ngIf="campaignForm.get('category')?.invalid">Category selection</li>
                      <li *ngIf="campaignForm.get('location')?.invalid">Location selection</li>
                      <li *ngIf="campaignForm.get('description')?.invalid">Description (min 50 chars)</li>
                      <li *ngIf="campaignForm.get('endDate')?.invalid">Campaign end date</li>
                      <li *ngIf="campaignForm.get('image')?.invalid">Cover image URL</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div class="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Mission Title</p>
                  <p class="font-bold text-slate-900">{{ campaignForm.value.title || 'Not specified' }}</p>
                </div>
                <div class="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Category & Location</p>
                  <p class="font-bold text-slate-900">{{ campaignForm.value.category || '—' }} • {{ campaignForm.value.location || '—' }}</p>
                </div>
                <div class="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Fundraising Goal</p>
                  <p class="font-bold text-primary-500 text-xl">৳{{ (campaignForm.value.goalAmount || 0).toLocaleString() }}</p>
                </div>
                <div class="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">End Date</p>
                  <p class="font-bold text-slate-900">{{ campaignForm.value.endDate || '—' | date }}</p>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row justify-between pt-10 border-t border-slate-100 gap-4">
                <button type="button" (click)="prevStep()" class="px-10 py-4 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 transition-all order-2 sm:order-1">Back to Edit</button>
                <button type="submit" [disabled]="loading() || campaignForm.invalid" 
                        class="px-12 py-5 bg-emerald-500 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/25 hover:bg-emerald-600 transition-all transform hover:-translate-y-1 disabled:opacity-50 order-1 sm:order-2">
                  {{ loading() ? (isEditMode() ? 'Updating...' : 'Publishing...') : (isEditMode() ? '🚀 Update Mission' : '🚀 Launch Mission') }}
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- SIDEBAR TIPS -->
        <div class="space-y-6 hidden lg:block">
          <div class="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm sticky top-32">
            <h4 class="font-display font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span class="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center text-sm">💡</span>
              Quick Tips
            </h4>
            <div class="space-y-6">
              <div>
                <h5 class="text-sm font-bold text-slate-900 mb-1">Impactful Photos</h5>
                <p class="text-xs text-slate-400 leading-relaxed">High-quality images increase donor confidence and volunteer engagement.</p>
              </div>
              <div>
                <h5 class="text-sm font-bold text-slate-900 mb-1">Specific Goals</h5>
                <p class="text-xs text-slate-400 leading-relaxed">Clearly state what the funds and volunteers will achieve on the ground.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-in { animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class CampaignCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private campaignService = inject(CampaignService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  currentStep = signal(1);
  maxStepReached = signal(1);
  loading = signal(false);
  isEditMode = signal(false);
  campaignId = signal<string | null>(null);

  steps = [
    { label: 'Basic Info', icon: 'fas fa-info-circle' },
    { label: 'Funding', icon: 'fas fa-dollar-sign' },
    { label: 'Volunteers', icon: 'fas fa-users' },
    { label: 'Media', icon: 'fas fa-image' },
    { label: 'Review', icon: 'fas fa-check-circle' }
  ];

  categories = ['Disaster Relief', 'Healthcare', 'Education', 'Environment', 'Food', 'Clothing', 'Others'];
  districts = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh', 'Nationwide'];

  campaignForm: FormGroup;

  constructor() {
    this.campaignForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      location: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(50)]],
      endDate: ['', Validators.required],
      goalAmount: [0, [Validators.required, Validators.min(0)]],
      volunteersRequired: [0, [Validators.required, Validators.min(0)]],
      image: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.authService.currentUser()?.role !== 'ngo') {
      this.toastr.error('Only NGOs can manage campaigns');
      this.router.navigate(['/']);
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.campaignId.set(id);
      this.fetchCampaignDetails(id);
    }
  }

  fetchCampaignDetails(id: string) {
    this.loading.set(true);
    this.campaignService.getCampaignById(id).subscribe({
      next: (res) => {
        const campaign = res.data;
        this.campaignForm.patchValue({
          title: campaign.title,
          category: campaign.category,
          location: campaign.location,
          description: campaign.description,
          endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '',
          goalAmount: campaign.goalAmount,
          volunteersRequired: campaign.volunteersRequired,
          image: campaign.image
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastr.error('Failed to load campaign for editing');
        this.router.navigate(['/ngo/campaigns']);
      }
    });
  }

  goToStep(step: number) {
    this.currentStep.set(step);
    if (step > this.maxStepReached()) this.maxStepReached.set(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextStep() {
    this.goToStep(this.currentStep() + 1);
  }

  prevStep() {
    this.goToStep(this.currentStep() - 1);
  }

  isInvalid(field: string) {
    const ctrl = this.campaignForm.get(field);
    return ctrl ? ctrl.invalid && (ctrl.dirty || ctrl.touched) : false;
  }

  onSubmit() {
    if (this.campaignForm.invalid) {
      this.toastr.error('Please complete all required fields correctly.');
      this.currentStep.set(5);
      return;
    }

    this.loading.set(true);
    const campaignData = { ...this.campaignForm.value };

    if (this.isEditMode()) {
      this.campaignService.updateCampaign(this.campaignId()!, campaignData).subscribe({
        next: () => {
          this.loading.set(false);
          this.toastr.success('Campaign updated successfully!');
          this.router.navigate(['/ngo/campaigns']);
        },
        error: (err) => {
          this.loading.set(false);
          this.toastr.error(err.error?.message || 'Failed to update campaign');
        }
      });
    } else {
      campaignData.ngo = this.authService.currentUser()?.id;
      this.campaignService.createCampaign(campaignData).subscribe({
        next: () => {
          this.loading.set(false);
          this.toastr.success('Campaign published successfully!');
          this.router.navigate(['/ngo/campaigns']);
        },
        error: (err) => {
          this.loading.set(false);
          this.toastr.error(err.error?.message || 'Failed to publish campaign');
        }
      });
    }
  }
}
