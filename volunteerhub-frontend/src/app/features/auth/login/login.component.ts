import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
        <div class="text-center">
          <div class="flex justify-center mb-6">
            <div class="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary-500/20">
              💚
            </div>
          </div>
          <h2 class="text-3xl font-display font-extrabold text-slate-900">Welcome Back</h2>
          <p class="mt-2 text-sm text-slate-500 font-medium">Log in to your VolunteerHub account</p>
        </div>

        <!-- ROLE TABS -->
        <div class="flex p-1 bg-slate-100 rounded-2xl mb-8">
          <button *ngFor="let role of roles" 
                  (click)="activeRole.set(role.id)"
                  [class]="activeRole() === role.id ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500'"
                  class="flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all">
            {{ role.name }}
          </button>
        </div>

        <form class="space-y-6" (ngSubmit)="handleLogin()">
          <div class="space-y-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">Email Address</label>
              <input type="email" [(ngModel)]="email" name="email" required
                     class="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none text-sm font-medium" 
                     placeholder="email@example.com">
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">Password</label>
              <input type="password" [(ngModel)]="password" name="password" required
                     class="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none text-sm font-medium" 
                     placeholder="••••••••">
            </div>
          </div>

          <div *ngIf="errorMessage()" class="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100 animate-shake">
            {{ errorMessage() }}
          </div>

          <button type="submit" [disabled]="loading()"
                  class="w-full py-5 bg-primary-500 hover:bg-primary-600 text-white font-extrabold rounded-2xl shadow-xl shadow-primary-500/20 transition-all flex items-center justify-center gap-3">
            <span *ngIf="loading()" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            {{ loading() ? 'Signing in...' : 'Sign In to Account' }}
          </button>
        </form>

        <div class="text-center pt-6 border-t border-slate-50">
          <p class="text-sm text-slate-500">
            Don't have an account? 
            <a [routerLink]="activeRole() === 'ngo' ? '/auth/register/ngo' : '/auth/register/volunteer'" 
               class="text-primary-600 font-bold hover:underline ml-1">
               Register Now
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
    @keyframes shake {
      10%, 90% { transform: translate3d(-1px, 0, 0); }
      20%, 80% { transform: translate3d(2px, 0, 0); }
      30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
      40%, 60% { transform: translate3d(4px, 0, 0); }
    }
  `]
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  activeRole = signal<'volunteer' | 'ngo' | 'admin'>('volunteer');
  
  roles: { id: 'volunteer' | 'ngo' | 'admin', name: string }[] = [
    { id: 'volunteer', name: 'Volunteer' },
    { id: 'ngo', name: 'NGO' },
    { id: 'admin', name: 'Admin' }
  ];

  email = '';
  password = '';
  
  loading = signal(false);
  errorMessage = signal('');

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['role'] && (params['role'] === 'ngo' || params['role'] === 'volunteer' || params['role'] === 'admin')) {
        this.activeRole.set(params['role'] as any);
      }
    });
  }

  handleLogin() {
    if (!this.email || !this.password) {
      this.errorMessage.set('Please fill in all fields');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        if (res.success) {
          const role = res.data.role;
          if (role === 'admin') this.router.navigate(['/admin']);
          else if (role === 'ngo') this.router.navigate(['/ngo']);
          else this.router.navigate(['/volunteer']);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Invalid credentials. Please try again.');
        this.loading.set(false);
      }
    });
  }
}
