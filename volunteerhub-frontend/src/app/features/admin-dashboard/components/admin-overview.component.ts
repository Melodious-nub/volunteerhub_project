import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 md:p-10 space-y-10 relative">
      <!-- STATS GRID -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div *ngFor="let stat of stats()" class="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 group hover:shadow-xl transition-all duration-500">
          <div class="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-xl md:text-2xl mb-6 shadow-lg transition-transform group-hover:scale-110" [ngClass]="stat.bg">
            <i [class]="stat.icon"></i>
          </div>
          <div class="text-3xl md:text-4xl font-display font-extrabold text-slate-900 mb-1 tracking-tight">{{ stat.value }}</div>
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{{ stat.label }}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- RECENT ACTIVITY -->
        <div class="lg:col-span-2 bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-sm border border-slate-100">
          <div class="flex items-center justify-between mb-8">
            <h3 class="text-xl md:text-2xl font-display font-bold text-slate-900">Recent Platform Activity</h3>
            <button (click)="fetchActivities()" class="p-2 text-slate-400 hover:text-primary-500 transition-all">
              <i class="fas fa-sync-alt text-sm"></i>
            </button>
          </div>
          
          <div class="space-y-4 md:space-y-6">
            <div *ngFor="let activity of activities()" class="p-4 md:p-6 bg-slate-50 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-between border border-slate-100 group hover:bg-white hover:border-primary-500/20 transition-all">
              <div class="flex items-center gap-4 md:gap-5">
                <div class="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-base md:text-lg shadow-sm shrink-0" [ngClass]="activity.bg">
                  <i [class]="activity.icon"></i>
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-bold text-slate-900 truncate">{{ activity.title }}</p>
                  <p class="text-[11px] md:text-xs text-slate-500 line-clamp-1">{{ activity.desc }}</p>
                </div>
              </div>
              <span class="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0 ml-2">
                {{ activity.time | date:'shortTime' }}
              </span>
            </div>
          </div>
        </div>

        <!-- QUICK ACTIONS -->
        <div class="bg-slate-900 rounded-[2rem] md:rounded-[3rem] p-8 md:p-10 text-white relative overflow-hidden">
          <div class="relative z-10">
            <h3 class="text-xl md:text-2xl font-display font-bold mb-6">Quick Actions</h3>
            <div class="space-y-4">
              <button (click)="generateReport()" class="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-primary-500 transition-all group">
                <p class="text-sm font-bold">Generate System Report</p>
                <p class="text-[10px] text-slate-400 group-hover:text-white/80">Export platform analytics (PDF)</p>
              </button>
              <button (click)="showBroadcastModal.set(true)" class="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-accent-500 transition-all group">
                <p class="text-sm font-bold">Broadcast Alert</p>
                <p class="text-[10px] text-slate-400 group-hover:text-white/80">Send urgent notification to all NGOs</p>
              </button>
              <button (click)="refreshStats()" class="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-white/10 transition-all group">
                <p class="text-sm font-bold">Refresh Analytics</p>
                <p class="text-[10px] text-slate-400 group-hover:text-white/80">Force update dashboard metrics</p>
              </button>
            </div>
          </div>
          <div class="absolute bottom-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      <!-- BROADCAST MODAL -->
      <div *ngIf="showBroadcastModal()" class="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
        <div class="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up">
          <div class="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 class="text-xl font-display font-bold text-slate-900">Broadcast Alert</h3>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Send notifications across platform</p>
            </div>
            <button (click)="showBroadcastModal.set(false)" class="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="p-8 space-y-5">
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Alert Title</label>
              <input type="text" [(ngModel)]="broadcastForm.title" placeholder="e.g., Emergency Update" 
                     class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-bold">
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Message Content</label>
              <textarea [(ngModel)]="broadcastForm.message" rows="4" placeholder="Enter your message here..."
                        class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-medium resize-none"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Target Audience</label>
                <select [(ngModel)]="broadcastForm.target" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl outline-none text-xs font-bold appearance-none">
                  <option value="all">Everyone</option>
                  <option value="ngo">NGOs Only</option>
                  <option value="volunteer">Volunteers Only</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Priority Level</label>
                <select [(ngModel)]="broadcastForm.type" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl outline-none text-xs font-bold appearance-none">
                  <option value="broadcast">Standard</option>
                  <option value="emergency">High Priority</option>
                </select>
              </div>
            </div>
          </div>

          <div class="p-8 bg-slate-50/50 border-t border-slate-50 flex gap-3">
            <button (click)="showBroadcastModal.set(false)" class="flex-1 py-4 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-all">Discard</button>
            <button (click)="submitBroadcast()" class="flex-[2] py-4 bg-slate-900 text-white text-sm font-bold rounded-2xl hover:bg-primary-600 transition-all shadow-lg shadow-slate-900/10">Send Broadcast</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AdminOverviewComponent implements OnInit {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);

  stats = signal<any[]>([
    { label: 'NGO Partners', value: '0', icon: 'fas fa-building', bg: 'bg-blue-50 text-blue-500', raw: 0 },
    { label: 'Total Volunteers', value: '0', icon: 'fas fa-user-friends', bg: 'bg-emerald-50 text-emerald-500', raw: 0 },
    { label: 'Active Missions', value: '0', icon: 'fas fa-bullhorn', bg: 'bg-orange-50 text-orange-500', raw: 0 },
    { label: 'Total Funds', value: '৳0', icon: 'fas fa-coins', bg: 'bg-primary-50 text-primary-500', raw: 0 }
  ]);

  activities = signal<any[]>([]);
  showBroadcastModal = signal(false);
  broadcastForm = {
    title: '',
    message: '',
    target: 'all',
    type: 'broadcast'
  };

  ngOnInit(): void {
    this.refreshStats(true);
    this.fetchActivities();
  }

  fetchActivities() {
    this.http.get<any>(`${environment.apiUrl}/admin/activities`).subscribe({
      next: (res) => {
        if (res.success) this.activities.set(res.data);
      }
    });
  }

  refreshStats(silent = false) {
    this.http.get<any>(`${environment.apiUrl}/admin/stats`).subscribe({
      next: (res) => {
        if (res.success) {
          const d = res.data;
          this.stats.set([
            { label: 'NGO Partners', value: d.totalNgos.toLocaleString(), icon: 'fas fa-building', bg: 'bg-blue-50 text-blue-500', raw: d.totalNgos },
            { label: 'Total Volunteers', value: d.totalVolunteers.toLocaleString(), icon: 'fas fa-user-friends', bg: 'bg-emerald-50 text-emerald-500', raw: d.totalVolunteers },
            { label: 'Active Missions', value: d.activeCampaigns.toLocaleString(), icon: 'fas fa-bullhorn', bg: 'bg-orange-50 text-orange-500', raw: d.activeCampaigns },
            { label: 'Total Funds', value: `৳${d.totalFundsRaised.toLocaleString()}`, icon: 'fas fa-coins', bg: 'bg-primary-50 text-primary-500', raw: d.totalFundsRaised }
          ]);
          if (!silent) this.toastr.info('Platform analytics updated');
        }
      }
    });
  }

  generateReport() {
    const doc = new jsPDF();
    const now = new Date().toLocaleString();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129); // primary-500
    doc.text('VolunteerHub System Report', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${now}`, 14, 30);
    doc.text('Confidential Administrative Document', 14, 35);
    
    // Summary Stats
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('Platform Summary', 14, 50);
    
    const statsData = this.stats().map(s => [s.label, s.value]);
    autoTable(doc, {
      startY: 55,
      head: [['Metric', 'Value']],
      body: statsData,
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42] }
    });

    // Recent Activity
    doc.text('Recent Platform Activity', 14, (doc as any).lastAutoTable.finalY + 20);
    const activityData = this.activities().map(a => [
      a.title,
      a.desc,
      new Date(a.time).toLocaleString()
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 25,
      head: [['Action', 'Details', 'Timestamp']],
      body: activityData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] }
    });

    doc.save(`volunteerhub-report-${new Date().getTime()}.pdf`);
    this.toastr.success('System report generated successfully!');
  }

  submitBroadcast() {
    if (!this.broadcastForm.title || !this.broadcastForm.message) {
      this.toastr.error('Please fill in all required fields');
      return;
    }

    this.http.post<any>(`${environment.apiUrl}/admin/notifications`, this.broadcastForm).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Platform broadcast sent successfully!');
          this.showBroadcastModal.set(false);
          this.broadcastForm = { title: '', message: '', target: 'all', type: 'broadcast' };
          this.fetchActivities(); // Refresh to show new notification in activity
        }
      },
      error: () => this.toastr.error('Failed to send broadcast')
    });
  }
}
