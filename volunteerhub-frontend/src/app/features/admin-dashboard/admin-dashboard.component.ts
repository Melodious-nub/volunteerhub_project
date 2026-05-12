import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-layout min-h-screen bg-slate-50 flex relative overflow-hidden">
      <!-- MOBILE OVERLAY -->
      <div *ngIf="isSidebarOpen()" 
           (click)="isSidebarOpen.set(false)"
           class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden animate-fade-in">
      </div>

      <!-- SIDEBAR -->
      <aside [class.-translate-x-full]="!isSidebarOpen()"
             class="fixed lg:sticky top-0 left-0 w-72 bg-slate-900 text-white flex flex-col shrink-0 h-screen z-[110] transition-transform duration-300 lg:translate-x-0 overflow-y-auto custom-scrollbar shadow-2xl lg:shadow-none">
        <div class="p-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/20">💚</div>
              <div>
                <div class="text-base font-display font-bold text-white leading-none tracking-tight">Volunteer<span class="text-primary-500">Hub</span></div>
                <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Administrative Control</span>
              </div>
            </div>
            <button (click)="isSidebarOpen.set(false)" class="lg:hidden text-slate-400 hover:text-white">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <nav class="flex-1 px-4 py-6 space-y-2">
          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-4">Core Management</div>
          <a routerLink="/admin" routerLinkActive="bg-accent-500 text-white shadow-xl shadow-accent-500/20" [routerLinkActiveOptions]="{exact: true}" (click)="isSidebarOpen.set(false)" class="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all hover:bg-white/5 text-slate-400 hover:text-white group">
            <i class="fas fa-chart-pie w-5 group-hover:scale-110 transition-transform"></i>
            <span class="font-bold text-sm">Overview</span>
          </a>
          <a routerLink="/admin/ngos" routerLinkActive="bg-accent-500 text-white shadow-xl shadow-accent-500/20" (click)="isSidebarOpen.set(false)" class="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all hover:bg-white/5 text-slate-400 hover:text-white group">
            <i class="fas fa-building w-5 group-hover:scale-110 transition-transform"></i>
            <span class="font-bold text-sm">Manage NGOs</span>
          </a>
          <a routerLink="/admin/volunteers" routerLinkActive="bg-accent-500 text-white shadow-xl shadow-accent-500/20" (click)="isSidebarOpen.set(false)" class="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all hover:bg-white/5 text-slate-400 hover:text-white group">
            <i class="fas fa-user-friends w-5 group-hover:scale-110 transition-transform"></i>
            <span class="font-bold text-sm">Volunteers</span>
          </a>
          <a routerLink="/admin/campaigns" routerLinkActive="bg-accent-500 text-white shadow-xl shadow-accent-500/20" (click)="isSidebarOpen.set(false)" class="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all hover:bg-white/5 text-slate-400 hover:text-white group">
            <i class="fas fa-bullhorn w-5 group-hover:scale-110 transition-transform"></i>
            <span class="font-bold text-sm">All Missions</span>
          </a>
          <a routerLink="/admin/messages" routerLinkActive="bg-accent-500 text-white shadow-xl shadow-accent-500/20" (click)="isSidebarOpen.set(false)" class="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all hover:bg-white/5 text-slate-400 hover:text-white group">
            <i class="fas fa-envelope w-5 group-hover:scale-110 transition-transform"></i>
            <span class="font-bold text-sm">User Messages</span>
          </a>
        </nav>

        <div class="p-6">
          <button (click)="logout()" class="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-red-500/10 text-red-500 font-bold text-sm hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/0 hover:shadow-red-500/20">
            <i class="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <!-- MAIN -->
      <main class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header class="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-10 shrink-0 sticky top-0 z-40">
          <div class="flex items-center gap-4">
            <button (click)="isSidebarOpen.set(true)" class="lg:hidden w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-600">
              <i class="fas fa-bars text-lg"></i>
            </button>
            <div class="hidden sm:block">
              <h2 class="text-lg md:text-xl font-display font-extrabold text-slate-900 leading-tight">System Control</h2>
              <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Administrative Oversight</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3 md:gap-6">
            <div class="text-right hidden sm:block">
              <p class="text-sm font-bold text-slate-900">Super Admin</p>
              <p class="text-[10px] font-bold text-accent-500 uppercase tracking-widest">Master Authority</p>
            </div>
            <div class="w-10 h-10 md:w-12 md:h-12 bg-slate-100 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-400 shadow-inner">
              <i class="fas fa-user-shield text-lg md:text-xl"></i>
            </div>
          </div>
        </header>

        <div class="flex-1 overflow-y-auto custom-scrollbar">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .dashboard-layout { height: 100vh; overflow: hidden; }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class AdminDashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isSidebarOpen = signal(false);

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
