import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { SosService } from '../../core/services/sos.service';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';

interface ApiResponse {
  success: boolean;
  data: any;
  message?: string;
}

@Component({
  selector: 'app-ngo-dashboard',
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
                <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">NGO Dashboard</span>
              </div>
            </div>
            <button (click)="isSidebarOpen.set(false)" class="lg:hidden text-slate-400 hover:text-white">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <div class="px-6 py-4">
          <div class="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
            <div class="w-12 h-12 bg-gradient-to-br from-primary-400 to-accent-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0">
              {{ user()?.name?.charAt(0) || 'N' }}
            </div>
            <div class="overflow-hidden">
              <h4 class="font-bold text-sm truncate">{{ user()?.name }}</h4>
              <p class="text-[10px] text-primary-400 uppercase font-bold tracking-widest">Verified NGO</p>
            </div>
          </div>
        </div>

        <nav class="flex-1 px-4 py-6 space-y-2">
          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2">Overview</div>
          <a routerLink="/ngo" routerLinkActive="bg-primary-500 text-white shadow-lg shadow-primary-500/20" [routerLinkActiveOptions]="{exact: true}" (click)="isSidebarOpen.set(false)" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 text-slate-400 hover:text-white group">
            <i class="fas fa-tachometer-alt w-5 group-hover:scale-110 transition-transform"></i>
            <span class="font-bold text-sm">Dashboard</span>
          </a>
          
          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mt-6 mb-2">Campaigns</div>
          <a routerLink="/ngo/campaigns" routerLinkActive="bg-primary-500 text-white shadow-lg shadow-primary-500/20" (click)="isSidebarOpen.set(false)" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 text-slate-400 hover:text-white group">
            <i class="fas fa-bullhorn w-5 group-hover:scale-110 transition-transform"></i>
            <span class="font-bold text-sm">My Campaigns</span>
          </a>
          <a routerLink="/ngo/volunteers" routerLinkActive="bg-primary-500 text-white shadow-lg shadow-primary-500/20" (click)="isSidebarOpen.set(false)" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 text-slate-400 hover:text-white group">
            <i class="fas fa-handshake w-5 group-hover:scale-110 transition-transform"></i>
            <span class="font-bold text-sm">Manage Volunteers</span>
          </a>

          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mt-6 mb-2">Analytics</div>
          <a routerLink="/ngo/reports" routerLinkActive="bg-primary-500 text-white shadow-lg shadow-primary-500/20" (click)="isSidebarOpen.set(false)" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 text-slate-400 hover:text-white group">
            <i class="fas fa-chart-bar w-5 group-hover:scale-110 transition-transform"></i>
            <span class="font-bold text-sm">Reports</span>
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
              <h2 class="text-xl font-display font-extrabold text-slate-900 leading-tight">NGO Control</h2>
              <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Organization Management</p>
            </div>
          </div>

          <div class="flex items-center gap-4 md:gap-6">
            <!-- Notifications Dropdown -->
            <div class="relative group">
              <button class="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary-500 transition-colors bg-slate-50 rounded-xl relative">
                <i class="fas fa-bell text-lg"></i>
                <span *ngIf="unreadCount() > 0" class="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
              </button>
              <div class="absolute right-0 top-full mt-2 w-72 md:w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-4 z-[100] transform origin-top-right scale-95 group-hover:scale-100">
                <div class="flex items-center justify-between px-4 py-2 mb-4 border-b border-slate-50">
                  <span class="text-xs font-bold text-slate-900 uppercase tracking-widest">Alerts Center</span>
                  <div class="flex items-center gap-2">
                    <button (click)="$event.stopPropagation(); fetchNotifications()" class="p-1.5 text-slate-400 hover:text-primary-500 transition-all active:rotate-180 duration-500">
                      <i class="fas fa-sync-alt text-[10px]"></i>
                    </button>
                    <span class="px-2 py-0.5 bg-primary-100 text-primary-600 rounded text-[9px] font-bold uppercase">{{ notifications().length }} Total</span>
                  </div>
                </div>
                <div class="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                  <div *ngFor="let note of notifications()" 
                       (click)="handleNotificationClick(note)"
                       class="p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 cursor-pointer group">
                    <p class="text-xs font-bold text-slate-900 mb-1 flex items-center gap-2" [class.text-red-600]="note.type === 'emergency'">
                      <span *ngIf="note.type === 'emergency'" class="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                      {{ note.title }}
                    </p>
                    <p class="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{{ note.message }}</p>
                    <div class="flex items-center justify-between mt-2">
                       <span *ngIf="note.type === 'emergency'" class="text-[8px] font-black text-red-500 uppercase tracking-widest">Action Required</span>
                       <span class="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">{{ note.createdAt | date:'shortTime' }}</span>
                    </div>
                  </div>
                  <div *ngIf="notifications().length === 0" class="py-10 text-center flex flex-col items-center">
                    <div class="text-3xl mb-2 opacity-20">🔔</div>
                    <p class="text-slate-400 italic text-xs font-medium">No new notifications.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="w-px h-6 bg-slate-200 hidden sm:block"></div>
            
            <div class="flex items-center gap-3">
              <div class="text-right hidden sm:block">
                <p class="text-sm font-bold text-slate-900 leading-tight">{{ user()?.name }}</p>
                <p class="text-[9px] font-bold text-primary-500 uppercase tracking-widest leading-none">Verified Partner</p>
              </div>
              <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 shadow-inner shrink-0">
                <i class="fas fa-building"></i>
              </div>
            </div>
          </div>
        </header>

        <!-- CHILD ROUTES CONTENT -->
        <div class="flex-1 overflow-y-auto custom-scrollbar">
          <router-outlet></router-outlet>
        </div>
      </main>

      <!-- SOS DETAIL MODAL -->
      <div *ngIf="selectedSOS()" class="fixed inset-0 z-[10000] overflow-y-auto">
        <div class="fixed inset-0 bg-slate-900/80 backdrop-blur-md" (click)="selectedSOS.set(null)"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-slide-up border-4 border-red-500/20">
            <!-- Header -->
            <div class="p-10 bg-red-600 text-white relative overflow-hidden">
              <div class="relative z-10 flex items-center justify-between">
                <div>
                  <div class="flex items-center gap-3 mb-2">
                    <span class="w-3 h-3 bg-white rounded-full animate-ping"></span>
                    <span class="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Incoming SOS Response Request</span>
                  </div>
                  <h3 class="text-3xl font-display font-black uppercase tracking-tighter">{{ selectedSOS().type }} Alert</h3>
                </div>
                <button (click)="selectedSOS.set(null)" class="w-12 h-12 bg-black/10 rounded-2xl flex items-center justify-center hover:bg-black/20 transition-all">
                  <i class="fas fa-times text-xl"></i>
                </button>
              </div>
              <div class="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            <!-- Content -->
            <div class="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-6">
                  <div>
                    <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Submitted By</label>
                    <div class="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div class="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center text-xl font-black">
                        {{ (selectedSOS().user?.name || 'A').charAt(0) }}
                      </div>
                      <div>
                        <p class="text-sm font-black text-slate-900">{{ selectedSOS().user?.name || 'Anonymous User' }}</p>
                        <p class="text-xs font-bold text-slate-400">{{ selectedSOS().user?.phone || 'No phone provided' }}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Situation Description</label>
                    <div class="p-5 bg-red-50/50 rounded-2xl border border-red-100 italic text-slate-700 text-sm leading-relaxed">
                      "{{ selectedSOS().description }}"
                    </div>
                  </div>
                </div>

                <div class="space-y-6">
                  <div>
                    <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Broadcast Scope</label>
                    <div class="px-4 py-2 bg-slate-900 text-white rounded-lg inline-block text-[10px] font-black uppercase tracking-[0.2em]">
                      {{ selectedSOS().notifiedTo || 'GENERAL' }} RESPONSE UNIT
                    </div>
                  </div>

                  <div>
                    <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Location Context</label>
                    <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <p class="text-xs font-bold text-slate-900 mb-2 flex items-center gap-2">
                         <i class="fas fa-map-marker-alt text-red-500"></i>
                         {{ selectedSOS().location?.address || 'Pinned Coordinates' }}
                       </p>
                       <div class="text-[10px] text-slate-500 font-medium">
                         Lat: {{ selectedSOS().location?.coordinates[1] }}<br>
                         Lng: {{ selectedSOS().location?.coordinates[0] }}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="pt-8 border-t border-slate-100">
                <button (click)="resolveSOS()" class="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 active:scale-95">
                  <i class="fas fa-check-circle"></i>
                  Confirm Resolution & Close Incident
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .dashboard-layout { height: 100vh; overflow: hidden; }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class NgoDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private http = inject(HttpClient);
  private sosService = inject(SosService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  
  user = this.authService.currentUser;
  isSidebarOpen = signal(false);
  
  notifications = signal<any[]>([]);
  unreadCount = signal(0);
  selectedSOS = signal<any | null>(null);

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

  handleNotificationClick(note: any) {
    if (note.type === 'emergency') {
      let sosId = note.extraData?.sosId;
      
      // Handle cases where extraData might be a JSON string
      if (!sosId && typeof note.extraData === 'string') {
        try {
          const parsed = JSON.parse(note.extraData);
          sosId = parsed.sosId;
        } catch (e) {}
      }

      if (sosId) {
        this.toastr.info('Loading emergency data...');
        this.fetchSOSDetails(sosId);
      } else {
        this.toastr.warning('This emergency alert has no associated data.');
      }
    }
  }

  fetchSOSDetails(id: string) {
    this.http.get<any>(`${environment.apiUrl}/sos/${id}`).subscribe((res) => {
      if (res.success) {
        this.selectedSOS.set(res.data);
      }
    });
  }

  resolveSOS() {
    const id = this.selectedSOS()?._id;
    if (id) {
      this.sosService.resolveAlert(id).subscribe({
        next: () => {
          this.toastr.success('Emergency alert resolved. Good job team!');
          this.selectedSOS.set(null);
          this.fetchNotifications();
        },
        error: () => this.toastr.error('Failed to resolve alert.')
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
