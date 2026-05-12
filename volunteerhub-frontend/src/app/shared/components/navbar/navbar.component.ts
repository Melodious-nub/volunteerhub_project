import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-white border-b border-slate-100 sticky top-0 z-[100] h-20 flex items-center">
      <div class="container mx-auto px-6 flex items-center justify-between">
        <a routerLink="/" class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">💚</div>
          <div class="hidden sm:block">
            <div class="text-base font-display font-bold text-slate-900 leading-none tracking-tight">Volunteer<span class="text-primary-500">Hub</span></div>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Charity Management</span>
          </div>
        </a>

        <ul class="hidden lg:flex items-center gap-8">
          <li *ngFor="let link of navLinks">
            <a [routerLink]="link.path" 
               routerLinkActive="text-primary-500 after:w-full"
               [routerLinkActiveOptions]="link.path === '/' ? {exact: true} : {exact: false}"
               class="text-sm font-bold text-slate-600 hover:text-primary-500 transition-all relative py-2 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-primary-500 after:w-0 after:transition-all hover:after:w-full">
              {{ link.label }}
            </a>
          </li>
        </ul>

        <div class="flex items-center gap-4">
          <div *ngIf="!currentUser()" class="flex items-center gap-3">
            <a routerLink="/auth/login" class="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-primary-500 transition-all">Sign In</a>
            <a routerLink="/auth/register/volunteer" class="px-6 py-2.5 bg-primary-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all">Get Started</a>
          </div>

          <div *ngIf="currentUser()" class="flex items-center gap-4">
            <div class="relative group">
              <button class="flex items-center gap-3 p-1.5 bg-slate-50 rounded-full border border-slate-100 hover:bg-slate-100 transition-all">
                <div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {{ currentUser()?.name?.charAt(0) || 'U' }}
                </div>
                <div class="hidden md:block pr-2">
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{{ currentUser()?.role }}</p>
                  <p class="text-xs font-bold text-slate-900 leading-none">{{ currentUser()?.name }}</p>
                </div>
                <i class="fas fa-chevron-down text-[10px] text-slate-400 mr-2"></i>
              </button>
              
              <div class="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right scale-95 group-hover:scale-100 p-2">
                <a [routerLink]="currentUser()?.role === 'ngo' ? '/ngo' : '/volunteer'" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-sm font-bold text-slate-600 transition-all">
                  <i class="fas fa-tachometer-alt text-primary-500"></i> Dashboard
                </a>
                <div class="h-px bg-slate-100 my-1"></div>
                <button (click)="logout()" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-sm font-bold text-red-500 transition-all">
                  <i class="fas fa-sign-out-alt"></i> Logout
                </button>
              </div>
            </div>
          </div>

          <!-- Mobile Menu Toggle -->
          <button (click)="isMobileMenuOpen.set(!isMobileMenuOpen())" class="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5">
            <span class="w-6 h-0.5 bg-slate-600 transition-all" [class.rotate-45]="isMobileMenuOpen()" [class.translate-y-2]="isMobileMenuOpen()"></span>
            <span class="w-6 h-0.5 bg-slate-600 transition-all" [class.opacity-0]="isMobileMenuOpen()"></span>
            <span class="w-6 h-0.5 bg-slate-600 transition-all" [class.-rotate-45]="isMobileMenuOpen()" [class.-translate-y-2]="isMobileMenuOpen()"></span>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div *ngIf="isMobileMenuOpen()" class="absolute top-full left-0 w-full bg-white border-b border-slate-100 lg:hidden py-6 px-6 space-y-4 animate-in">
        <a *ngFor="let link of navLinks" 
           [routerLink]="link.path" 
           (click)="isMobileMenuOpen.set(false)"
           class="block py-3 text-lg font-bold text-slate-600 border-b border-slate-50 last:border-0">
          {{ link.label }}
        </a>
        <div *ngIf="!currentUser()" class="pt-4 flex flex-col gap-3">
          <a routerLink="/auth/login" class="w-full py-4 bg-slate-50 text-slate-600 text-center font-bold rounded-2xl">Sign In</a>
          <a routerLink="/auth/login" class="w-full py-4 bg-primary-500 text-white text-center font-bold rounded-2xl">Get Started</a>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    :host { display: block; }
    .animate-in { animation: slideDown 0.3s ease-out; }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  router = inject(Router);
  
  currentUser = this.authService.currentUser;
  isMobileMenuOpen = signal(false);

  navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Campaigns', path: '/campaigns' },
    { label: 'Emergency', path: '/emergency-sos' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'FAQ', path: '/faq' }
  ];

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
