import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CampaignService } from '../../core/services/campaign.service';

@Component({
  selector: 'app-volunteer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-layout min-h-screen bg-slate-50 flex">
      <!-- SIDEBAR -->
      <aside class="w-72 bg-slate-900 text-white flex flex-col shrink-0 transition-all duration-300 h-screen sticky top-0 overflow-y-auto custom-scrollbar">
        <div class="p-8">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">💚</div>
            <span class="text-xl font-display font-extrabold tracking-tight">Volunteer<span class="text-primary-400">Hub</span></span>
          </div>
        </div>

        <div class="px-6 py-4">
          <div class="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
            <div class="w-12 h-12 bg-gradient-to-br from-accent-400 to-primary-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {{ user()?.name?.charAt(0) || 'V' }}
            </div>
            <div class="overflow-hidden">
              <h4 class="font-bold text-sm truncate">{{ user()?.name }}</h4>
              <p class="text-[10px] text-accent-400 uppercase font-bold tracking-widest">Active Volunteer</p>
            </div>
          </div>
        </div>

        <nav class="flex-1 px-4 py-6 space-y-2">
          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2">Overview</div>
          <a routerLink="/volunteer" routerLinkActive="bg-primary-500 text-white shadow-lg shadow-primary-500/20" [routerLinkActiveOptions]="{exact: true}" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 text-slate-400 hover:text-white group">
            <i class="fas fa-tachometer-alt w-5 group-hover:scale-110 transition-transform"></i>
            <span class="font-bold text-sm">Dashboard</span>
          </a>
          
          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mt-6 mb-2">My Work</div>
          <a routerLink="/volunteer/tasks" routerLinkActive="bg-primary-500 text-white shadow-lg shadow-primary-500/20" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 text-slate-400 hover:text-white group relative">
            <i class="fas fa-tasks w-5 group-hover:scale-110 transition-transform"></i>
            <span class="font-bold text-sm">My Tasks</span>
          </a>
          <a routerLink="/volunteer/history" routerLinkActive="bg-primary-500 text-white shadow-lg shadow-primary-500/20" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 text-slate-400 hover:text-white group">
            <i class="fas fa-history w-5 group-hover:scale-110 transition-transform"></i>
            <span class="font-bold text-sm">History</span>
          </a>

          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mt-6 mb-2">Achievements</div>
          <a routerLink="/volunteer/certificates" routerLinkActive="bg-primary-500 text-white shadow-lg shadow-primary-500/20" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 text-slate-400 hover:text-white group">
            <i class="fas fa-certificate w-5 group-hover:scale-110 transition-transform"></i>
            <span class="font-bold text-sm">Certificates</span>
          </a>
        </nav>

        <div class="p-6">
          <button (click)="logout()" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 font-bold text-sm transition-all hover:bg-red-500 hover:text-white shadow-lg shadow-red-500/0 hover:shadow-red-500/20">
            <i class="fas fa-sign-out-alt"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <!-- MAIN CONTENT -->
      <main class="flex-1 flex flex-col h-screen overflow-y-auto">
        <!-- TOPBAR -->
        <header class="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-20">
          <div>
            <h2 class="text-xl font-display font-extrabold text-slate-900">Volunteer Dashboard</h2>
            <div class="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <a routerLink="/" class="hover:text-primary-500">Home</a>
              <i class="fas fa-chevron-right text-[8px]"></i>
              <span>Dashboard</span>
            </div>
          </div>

          <div class="flex items-center gap-8">
            <!-- Availability Toggle -->
            <div class="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-full border border-slate-200">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Status:</span>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full" [ngClass]="isAvailable() ? 'bg-accent-500 shadow-[0_0_8px_rgba(0,200,150,0.5)]' : 'bg-slate-300'"></span>
                <span class="text-xs font-bold" [ngClass]="isAvailable() ? 'text-accent-600' : 'text-slate-500'">{{ isAvailable() ? 'Available' : 'Offline' }}</span>
              </div>
              <button (click)="toggleAvailability()" class="w-8 h-4 bg-slate-200 rounded-full relative transition-all" [ngClass]="{'bg-accent-500': isAvailable()}">
                <div class="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-all" [style.left.px]="isAvailable() ? 17 : 2"></div>
              </button>
            </div>

            <button class="relative w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary-500 transition-colors">
              <i class="fas fa-bell text-lg"></i>
              <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div class="w-px h-6 bg-slate-200"></div>
            <div class="flex items-center gap-3 cursor-pointer group">
              <div class="text-right">
                <p class="text-sm font-bold text-slate-900 group-hover:text-primary-500 transition-colors">{{ user()?.name }}</p>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ user()?.role }}</p>
              </div>
              <div class="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 overflow-hidden">
                <i class="fas fa-user"></i>
              </div>
            </div>
          </div>
        </header>

        <!-- DASHBOARD CONTENT -->
        <div class="p-10 space-y-10">
          <!-- WELCOME -->
          <div class="space-y-6">
            <div>
              <h1 class="text-3xl font-display font-extrabold text-slate-900 mb-2">Good Day, {{ user()?.name }}! 👋</h1>
              <p class="text-slate-500 font-medium">You are currently helping in <span class="text-primary-500 font-bold">{{ joinedCampaigns().length }} campaigns</span>. Keep up the great work!</p>
            </div>
          </div>

          <!-- STATS GRID -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div *ngFor="let stat of stats()" class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
              <div class="relative z-10 flex flex-col">
                <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-4 transition-all group-hover:scale-110 shadow-lg" [ngClass]="stat.bg">
                  <i [class]="stat.icon"></i>
                </div>
                <div class="text-3xl font-display font-extrabold text-slate-900 mb-1">{{ stat.value }}</div>
                <div class="text-xs font-bold text-slate-400 uppercase tracking-widest">{{ stat.label }}</div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- JOINED CAMPAIGNS -->
            <div class="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div class="p-6 border-b border-slate-50 flex items-center justify-between">
                <h3 class="font-display font-bold text-slate-900">📢 My Joined Campaigns</h3>
                <a routerLink="/campaigns" class="text-sm font-bold text-primary-500 hover:underline">Find More</a>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-left">
                  <thead class="bg-slate-50">
                    <tr>
                      <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Campaign</th>
                      <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">NGO</th>
                      <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                      <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-50">
                    <tr *ngFor="let camp of joinedCampaigns()" class="hover:bg-slate-50/50 transition-colors">
                      <td class="px-6 py-5">
                        <div class="font-bold text-slate-900 text-sm">{{ camp.title }}</div>
                        <div class="text-[10px] text-slate-400 font-medium">{{ camp.location }}</div>
                      </td>
                      <td class="px-6 py-5">
                        <div class="text-sm font-medium text-slate-600">{{ camp.ngo?.name }}</div>
                      </td>
                      <td class="px-6 py-5">
                        <span class="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-[10px] font-bold uppercase">{{ camp.category }}</span>
                      </td>
                      <td class="px-6 py-5 text-center">
                        <a [routerLink]="['/campaigns', camp._id]" class="px-4 py-2 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-600 font-bold rounded-xl text-xs transition-all">Details</a>
                      </td>
                    </tr>
                    <tr *ngIf="joinedCampaigns().length === 0">
                      <td colspan="4" class="px-6 py-10 text-center text-slate-400 italic">You haven't joined any campaigns yet.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- ACHIEVEMENTS -->
            <div class="space-y-8">
              <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div class="p-6 border-b border-slate-50">
                  <h3 class="font-display font-bold text-slate-900">🏆 Achievements</h3>
                </div>
                <div class="p-6 space-y-4">
                  <div class="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <div class="text-2xl">🥇</div>
                    <div>
                      <h4 class="font-bold text-amber-900 text-sm">Top Contributor</h4>
                      <p class="text-[10px] text-amber-700">Ranked top 10 this month</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100 opacity-50">
                    <div class="text-2xl">🏅</div>
                    <div>
                      <h4 class="font-bold text-blue-900 text-sm">100 Hour Hero</h4>
                      <p class="text-[10px] text-blue-700">92/100 hours completed</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- IMPACT CARD -->
              <div class="bg-primary-900 rounded-3xl p-6 text-white relative overflow-hidden">
                <div class="relative z-10">
                  <h3 class="font-display font-bold mb-4 text-sm uppercase tracking-widest text-primary-400">Total Impact</h3>
                  <div class="text-4xl font-display font-extrabold mb-2">5,240</div>
                  <p class="text-xs text-primary-200">Lives touched through your volunteer work and contributions.</p>
                </div>
                <div class="absolute -bottom-4 -right-4 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .dashboard-layout {
      height: 100vh;
      overflow: hidden;
    }
  `]
})
export class VolunteerDashboardComponent implements OnInit {
  authService = inject(AuthService);
  campaignService = inject(CampaignService);
  user = this.authService.currentUser;
  isAvailable = signal(true);

  stats = signal([
    { label: 'Tasks Completed', value: '24', icon: 'fas fa-check-circle', bg: 'bg-primary-100 text-primary-600' },
    { label: 'Volunteer Hours', value: '128h', icon: 'fas fa-clock', bg: 'bg-accent-100 text-accent-600' },
    { label: 'Points Earned', value: '850', icon: 'fas fa-star', bg: 'bg-orange-100 text-orange-600' },
    { label: 'Certificates', value: '4', icon: 'fas fa-certificate', bg: 'bg-red-100 text-red-600' }
  ]);

  joinedCampaigns = signal<any[]>([]);

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.fetchJoinedCampaigns();
  }

  fetchJoinedCampaigns() {
    this.campaignService.getJoinedCampaigns().subscribe({
      next: (res) => {
        this.joinedCampaigns.set(res.data);
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
