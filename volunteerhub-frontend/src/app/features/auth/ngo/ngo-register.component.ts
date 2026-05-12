import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-ngo-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="page-wrapper bg-slate-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        <!-- Left Side: Info -->
        <div class="md:w-1/3 bg-slate-900 p-10 text-white flex flex-col justify-center">
          <div class="text-5xl mb-6">🏢</div>
          <h2 class="text-3xl font-display font-bold mb-4">Register Your NGO</h2>
          <p class="text-slate-400 mb-8 text-sm leading-relaxed">
            Join VolunteerHub as a verified NGO and start creating campaigns and managing volunteers.
          </p>
          
          <div class="space-y-6">
            <div class="flex gap-4">
              <div class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">📢</div>
              <div>
                <h5 class="font-bold text-sm">Create Campaigns</h5>
                <p class="text-xs text-slate-500">Launch fundraising and volunteer campaigns.</p>
              </div>
            </div>
            <div class="flex gap-4">
              <div class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">👥</div>
              <div>
                <h5 class="font-bold text-sm">Manage Volunteers</h5>
                <p class="text-xs text-slate-500">Recruit and coordinate with volunteers.</p>
              </div>
            </div>
            <div class="flex gap-4">
              <div class="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">✅</div>
              <div>
                <h5 class="font-bold text-sm">Verified Badge</h5>
                <p class="text-xs text-slate-500">Build trust with a verified organization profile.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Form -->
        <div class="md:w-2/3 p-10 sm:p-12">
          <div class="flex items-center gap-3 mb-8">
            <div class="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold">💚</div>
            <span class="text-xl font-display font-extrabold text-slate-900">Volunteer<span class="text-primary-500">Hub</span></span>
          </div>

          <h2 class="text-2xl font-display font-bold text-slate-900 mb-2">NGO Registration</h2>
          <p class="text-slate-500 text-sm mb-8">
            Already registered? <a routerLink="/auth/login" class="text-primary-600 font-semibold hover:underline">Sign in here</a>
          </p>

          <!-- Step Indicator -->
          <div class="flex items-center justify-between mb-10 relative">
            <div class="absolute top-5 left-0 w-full h-0.5 bg-slate-100 -z-0"></div>
            <div *ngFor="let step of steps; let i = index" 
                 class="relative z-10 flex flex-col items-center gap-2 flex-1"
                 [class.active]="currentStep() === i + 1"
                 [class.done]="currentStep() > i + 1">
              <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300"
                   [ngClass]="{
                     'bg-primary-500 text-white shadow-lg shadow-primary-200': currentStep() === i + 1,
                     'bg-accent-500 text-white': currentStep() > i + 1,
                     'bg-slate-100 text-slate-400': currentStep() < i + 1
                   }">
                <span *ngIf="currentStep() <= i + 1">{{ i + 1 }}</span>
                <span *ngIf="currentStep() > i + 1">✓</span>
              </div>
              <span class="text-[10px] font-bold uppercase tracking-wider" 
                    [ngClass]="currentStep() >= i + 1 ? 'text-primary-600' : 'text-slate-400'">
                {{ step }}
              </span>
            </div>
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <!-- STEP 1: Organization -->
            <div *ngIf="currentStep() === 1" class="space-y-4 animate-in">
              <div class="form-group">
                <label class="text-sm font-bold text-slate-700 mb-1 block">Organization Name</label>
                <input type="text" formControlName="orgName" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all" placeholder="Legal name of NGO">
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                  <label class="text-sm font-bold text-slate-700 mb-1 block">Registration No.</label>
                  <input type="text" formControlName="regNo" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all" placeholder="Reg. #">
                </div>
                <div class="form-group">
                  <label class="text-sm font-bold text-slate-700 mb-1 block">Established Year</label>
                  <input type="number" formControlName="establishedYear" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all" placeholder="2010">
                </div>
              </div>
              <div class="form-group">
                <label class="text-sm font-bold text-slate-700 mb-1 block">Focus Areas</label>
                <div class="flex flex-wrap gap-2">
                  <button type="button" *ngFor="let area of focusAreas" 
                          (click)="toggleFocusArea(area)"
                          [ngClass]="selectedFocusAreas().includes(area) ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-500'"
                          class="px-3 py-1.5 rounded-full border text-xs font-semibold transition-all">
                    {{ area }}
                  </button>
                </div>
              </div>
              <div class="flex justify-end pt-4">
                <button type="button" (click)="nextStep()" class="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/25 transition-all">
                  Next: Contact <i class="fas fa-arrow-right ml-2"></i>
                </button>
              </div>
            </div>

            <!-- STEP 2: Contact -->
            <div *ngIf="currentStep() === 2" class="space-y-4 animate-in">
              <div class="form-group">
                <label class="text-sm font-bold text-slate-700 mb-1 block">Contact Person</label>
                <input type="text" formControlName="contactPerson" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all" placeholder="Full name">
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                  <label class="text-sm font-bold text-slate-700 mb-1 block">Email</label>
                  <input type="email" formControlName="email" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all" placeholder="org@email.com">
                </div>
                <div class="form-group">
                  <label class="text-sm font-bold text-slate-700 mb-1 block">Phone</label>
                  <input type="tel" formControlName="phone" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all" placeholder="Phone #">
                </div>
              </div>
              <div class="form-group">
                <label class="text-sm font-bold text-slate-700 mb-1 block">Office Address</label>
                <textarea formControlName="address" rows="2" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all" placeholder="Full address"></textarea>
              </div>
              <div class="flex justify-between pt-4">
                <button type="button" (click)="prevStep()" class="px-8 py-3 text-slate-500 font-bold hover:text-slate-900 transition-all">
                  <i class="fas fa-arrow-left mr-2"></i> Back
                </button>
                <button type="button" (click)="nextStep()" class="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/25 transition-all">
                  Next: Account <i class="fas fa-arrow-right ml-2"></i>
                </button>
              </div>
            </div>

            <!-- STEP 3: Account -->
            <div *ngIf="currentStep() === 3" class="space-y-4 animate-in">
              <div class="form-group">
                <label class="text-sm font-bold text-slate-700 mb-1 block">Password</label>
                <input type="password" formControlName="password" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all" placeholder="••••••••">
              </div>
              <div class="form-group">
                <label class="text-sm font-bold text-slate-700 mb-1 block">Confirm Password</label>
                <input type="password" formControlName="confirmPassword" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all" placeholder="••••••••">
              </div>
              
              <div class="space-y-2 pt-4">
                <div class="flex items-center gap-3">
                  <input type="checkbox" formControlName="agreeTerms" id="agreeNgo" class="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500">
                  <label for="agreeNgo" class="text-xs text-slate-500">I agree to the Terms of Service and Privacy Policy</label>
                </div>
                <div class="flex items-center gap-3">
                  <input type="checkbox" formControlName="certifyInfo" id="certify" class="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500">
                  <label for="certify" class="text-xs text-slate-500">I certify that all provided information is accurate.</label>
                </div>
              </div>

              <div class="flex justify-between pt-6">
                <button type="button" (click)="prevStep()" class="px-8 py-3 text-slate-500 font-bold hover:text-slate-900 transition-all">
                  <i class="fas fa-arrow-left mr-2"></i> Back
                </button>
                <button type="submit" [disabled]="loading() || !registerForm.valid" class="px-8 py-3 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-xl shadow-lg shadow-accent-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {{ loading() ? 'Submitting...' : 'Register NGO 🚀' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateX(10px); }
      to { opacity: 1; transform: translateX(0); }
    }
  `]
})
export class NgoRegisterComponent {
  currentStep = signal(1);
  loading = signal(false);
  steps = ['Organization', 'Contact', 'Account'];
  focusAreas = ['🌊 Disaster Relief', '🏥 Healthcare', '📚 Education', '🌿 Environment', '👶 Child Welfare', '♀️ Women Empowerment', '🍚 Food Security'];
  selectedFocusAreas = signal<string[]>([]);

  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      orgName: ['', Validators.required],
      regNo: ['', Validators.required],
      establishedYear: ['', Validators.required],
      contactPerson: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      agreeTerms: [false, Validators.requiredTrue],
      certifyInfo: [false, Validators.requiredTrue]
    });
  }

  nextStep() {
    if (this.currentStep() < 3) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  toggleFocusArea(area: string) {
    this.selectedFocusAreas.update(areas => 
      areas.includes(area) ? areas.filter(a => a !== area) : [...areas, area]
    );
  }

  onSubmit() {
    if (this.registerForm.invalid) return;
    
    if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
      this.toastr.error('Passwords do not match');
      return;
    }

    this.loading.set(true);
    const formData = {
      ...this.registerForm.value,
      name: this.registerForm.value.orgName,
      role: 'ngo',
      meta: {
        registrationNumber: this.registerForm.value.regNo,
        establishedYear: this.registerForm.value.establishedYear,
        focusAreas: this.selectedFocusAreas(),
        address: this.registerForm.value.address
      }
    };

    this.authService.register(formData).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        this.toastr.success('Registration submitted for verification!');
        this.router.navigate(['/auth/login']);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.toastr.error(err.error.message || 'Registration failed');
      }
    });
  }
}
