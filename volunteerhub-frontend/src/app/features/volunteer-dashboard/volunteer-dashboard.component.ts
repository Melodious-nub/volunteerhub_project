import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

interface ApiResponse {
  success: boolean;
  data: any;
  message?: string;
}

@Component({
  selector: 'app-volunteer-dashboard',
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
              <div class="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/20">💚</div>
              <div>
                <div class="text-base font-display font-bold text-white leading-none tracking-tight">Volunteer<span class="text-emerald-500">Hub</span></div>
                <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Volunteer Space</span>
              </div>
            </div>
            <button (click)="isSidebarOpen.set(false)" class="lg:hidden text-slate-400 hover:text-white">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <div class="px-6 py-4">
          <div class="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
            <div class="w-12 h-12 bg-gradient-to-br from-emerald-400 to-primary-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0">
              {{ user()?.name?.charAt(0) || 'V' }}
            </div>
            <div class="overflow-hidden">
              <h4 class="font-bold text-sm truncate">{{ user()?.name }}</h4>
              <p class="text-[10px] text-emerald-400 uppercase font-bold tracking-widest">Active Volunteer</p>
            </div>
          </div>
        </div>

        <nav class="flex-1 px-4 py-6 space-y-2">
          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2">Overview</div>
          <a routerLink="/volunteer" routerLinkActive="bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" [routerLinkActiveOptions]="{exact: true}" (click)="isSidebarOpen.set(false)" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 text-slate-400 hover:text-white group">
            <i class="fas fa-tachometer-alt w-5 group-hover:scale-110 transition-transform"></i>
            <span class="font-bold text-sm">Dashboard</span>
          </a>
          
          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mt-6 mb-2">My Work</div>
          <a routerLink="/volunteer/explore" routerLinkActive="bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" (click)="isSidebarOpen.set(false)" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 text-slate-400 hover:text-white group">
            <i class="fas fa-search-location w-5 group-hover:scale-110 transition-transform"></i>
            <span class="font-bold text-sm">Explore Missions</span>
          </a>
          <a routerLink="/volunteer/tasks" routerLinkActive="bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" (click)="isSidebarOpen.set(false)" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 text-slate-400 hover:text-white group">
            <i class="fas fa-tasks w-5 group-hover:scale-110 transition-transform"></i>
            <span class="font-bold text-sm">My Tasks</span>
          </a>
          <a routerLink="/volunteer/history" routerLinkActive="bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" (click)="isSidebarOpen.set(false)" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 text-slate-400 hover:text-white group">
            <i class="fas fa-history w-5 group-hover:scale-110 transition-transform"></i>
            <span class="font-bold text-sm">Activity Log</span>
          </a>

          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mt-6 mb-2">Rewards</div>
          <a routerLink="/volunteer/certificates" routerLinkActive="bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" (click)="isSidebarOpen.set(false)" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 text-slate-400 hover:text-white group">
            <i class="fas fa-certificate w-5 group-hover:scale-110 transition-transform"></i>
            <span class="font-bold text-sm">Certificates</span>
          </a>
        </nav>

        <div class="p-6">
          <button (click)="logout()" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 font-bold text-sm transition-all hover:bg-red-500 hover:text-white shadow-lg">
            <i class="fas fa-sign-out-alt"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <!-- MAIN CONTENT -->
      <main class="flex-1 flex flex-col h-screen overflow-hidden relative">

        <!-- TOPBAR -->
        <header class="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-10 shrink-0 sticky top-0 z-50">
          <div class="flex items-center gap-4">
            <button (click)="isSidebarOpen.set(true)" class="lg:hidden w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-600">
              <i class="fas fa-bars text-lg"></i>
            </button>
            <div class="hidden sm:block">
              <h2 class="text-xl font-display font-extrabold text-slate-900 leading-tight">Volunteer Portal</h2>
              <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Making a Difference</p>
            </div>
          </div>

          <div class="flex items-center gap-4 md:gap-8">
            <!-- Availability Toggle -->
            <div class="hidden md:flex items-center gap-3 px-5 py-2.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</span>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full" [ngClass]="isAvailable() ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'"></span>
                <span class="text-xs font-bold" [ngClass]="isAvailable() ? 'text-emerald-600' : 'text-slate-500'">{{ isAvailable() ? 'Active' : 'Offline' }}</span>
              </div>
              <button (click)="toggleAvailability()" class="w-9 h-5 bg-slate-200 rounded-full relative transition-all" [ngClass]="{'bg-emerald-500': isAvailable()}">
                <div class="absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all" [style.left.px]="isAvailable() ? 16 : 2"></div>
              </button>
            </div>

            <!-- Notifications Dropdown -->
            <div class="relative group">
              <button class="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-colors bg-slate-50 rounded-xl relative">
                <i class="fas fa-bell text-lg"></i>
                <span *ngIf="unreadCount() > 0" class="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div class="absolute right-0 top-full mt-2 w-72 md:w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-4 z-[100] transform origin-top-right scale-95 group-hover:scale-100">
                <div class="flex items-center justify-between px-4 py-2 mb-4 border-b border-slate-50">
                  <span class="text-xs font-bold text-slate-900 uppercase tracking-widest">Broadcasts</span>
                  <span class="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded text-[9px] font-bold">{{ notifications().length }} Alerts</span>
                </div>
                <div class="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                  <div *ngFor="let note of notifications()" class="p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                    <p class="text-xs font-bold text-slate-900 mb-1" [class.text-red-600]="note.type === 'emergency'">{{ note.title }}</p>
                    <p class="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{{ note.message }}</p>
                    <span class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2 block text-right">{{ note.createdAt | date:'shortTime' }}</span>
                  </div>
                  <div *ngIf="notifications().length === 0" class="p-8 text-center text-slate-400 italic text-sm">
                    No new broadcasts.
                  </div>
                </div>
              </div>
            </div>
            
            <div class="w-px h-6 bg-slate-200 hidden sm:block"></div>
            
            <div class="flex items-center gap-3">
              <div class="text-right hidden sm:block">
                <p class="text-sm font-bold text-slate-900 leading-tight">{{ user()?.name }}</p>
                <p class="text-[9px] font-bold text-emerald-500 uppercase tracking-widest leading-none">Verified Volunteer</p>
              </div>
              <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 shadow-inner shrink-0">
                <i class="fas fa-user text-lg"></i>
              </div>
            </div>
          </div>
        </header>

        <!-- CHILD ROUTES CONTENT -->
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
export class VolunteerDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);
  
  user = this.authService.currentUser;
  isSidebarOpen = signal(false);
  isAvailable = signal(true);
  
  notifications = signal<any[]>([]);
  unreadCount = signal(0);

  ngOnInit(): void {
    this.fetchNotifications();
  }

  fetchNotifications() {
    this.http.get<any>(`${environment.apiUrl}/notifications`).subscribe((res: ApiResponse) => {
      if (res.success) {
        this.notifications.set(res.data);
        this.unreadCount.set(res.data.length);
      }
    });
  }

  toggleAvailability() {
    this.isAvailable.update(v => !v);
  }


  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
