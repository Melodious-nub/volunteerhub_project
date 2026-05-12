import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-volunteer-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="page-wrapper bg-slate-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden p-10 sm:p-12">
        <div class="flex items-center gap-3 mb-8 justify-center">
          <div class="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold">💚</div>
          <span class="text-xl font-display font-extrabold text-slate-900">Volunteer<span class="text-primary-500">Hub</span></span>
        </div>

        <div class="text-center mb-10">
          <h2 class="text-3xl font-display font-bold text-slate-900 mb-2">Welcome Back!</h2>
          <p class="text-slate-500">Sign in to your volunteer account</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="form-group">
            <label class="text-sm font-bold text-slate-700 mb-1 block">Email Address</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <i class="fas fa-envelope"></i>
              </span>
              <input type="email" formControlName="email" class="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all" placeholder="your@email.com">
            </div>
          </div>

          <div class="form-group">
            <div class="flex justify-between items-center mb-1">
              <label class="text-sm font-bold text-slate-700 block">Password</label>
              <a href="#" class="text-xs text-primary-600 font-semibold hover:underline">Forgot password?</a>
            </div>
            <div class="relative group">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <i class="fas fa-lock"></i>
              </span>
              <input [type]="showPassword() ? 'text' : 'password'" formControlName="password" class="w-full pl-12 pr-12 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all" placeholder="••••••••">
              <button type="button" 
                      (click)="showPassword.set(!showPassword())"
                      class="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-primary-500 transition-colors rounded-lg hover:bg-slate-50"
                      [title]="showPassword() ? 'Hide password' : 'Show password'">
                <svg *ngIf="!showPassword()" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg *ngIf="showPassword()" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
              </button>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <input type="checkbox" id="remember" class="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500">
            <label for="remember" class="text-sm text-slate-500 font-medium">Remember me</label>
          </div>

          <button type="submit" [disabled]="loading() || !loginForm.valid" class="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/25 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed">
            {{ loading() ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="mt-10 pt-10 border-t border-slate-100 text-center">
          <p class="text-sm text-slate-500">
            Don't have an account? 
            <a routerLink="/auth/volunteer/register" class="text-primary-600 font-bold hover:underline">Register as Volunteer</a>
          </p>
          <div class="mt-4">
            <a routerLink="/auth/ngo/login" class="text-xs text-slate-400 hover:text-primary-600 font-semibold uppercase tracking-wider">Are you an NGO? Login here</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class VolunteerLoginComponent {
  loading = signal(false);
  showPassword = signal(false);
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.authService.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        this.toastr.success('Welcome back!');
        this.router.navigate(['/volunteer']);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.toastr.error(err.error.message || 'Login failed');
      }
    });
  }
}
