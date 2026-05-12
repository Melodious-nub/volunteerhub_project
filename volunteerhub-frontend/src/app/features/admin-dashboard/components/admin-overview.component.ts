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
    <!-- ROOT CONTAINER -->
    <div class="relative min-h-full">
      
      <!-- MAIN CONTENT WRAPPER (This handles the spacing) -->
      <div class="p-6 md:p-10 space-y-10">
        <!-- STATS GRID -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div *ngFor="let stat of stats()" class="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:shadow-xl transition-all duration-500 flex flex-col justify-between h-full min-w-0">
            <div class="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-lg md:text-xl mb-4 shadow-md transition-transform group-hover:scale-110 shrink-0" [ngClass]="stat.bg">
              <i [class]="stat.icon"></i>
            </div>
            <div class="min-w-0">
              <div class="text-xl md:text-2xl font-display font-black text-slate-900 mb-1 tracking-tighter break-words leading-tight">{{ stat.value }}</div>
              <div class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none">{{ stat.label }}</div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- RECENT ACTIVITY -->
          <div class="lg:col-span-2 bg-white rounded-[3rem] p-6 md:p-10 shadow-sm border border-slate-100">
            <div class="flex items-center justify-between mb-8">
              <h3 class="text-xl md:text-2xl font-display font-bold text-slate-900">Platform Pulse</h3>
              <button (click)="fetchActivities()" class="p-2 text-slate-400 hover:text-primary-500 transition-all">
                <i class="fas fa-sync-alt text-sm"></i>
              </button>
            </div>
            
            <div class="space-y-4">
              <div *ngFor="let activity of activities()" class="p-4 md:p-6 bg-slate-50 rounded-[2rem] flex items-center justify-between border border-slate-100 group hover:bg-white hover:border-primary-500/20 transition-all">
                <div class="flex items-center gap-4 md:gap-5">
                  <div class="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center text-base md:text-lg shadow-sm shrink-0" [ngClass]="activity.bg">
                    <i [class]="activity.icon"></i>
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-bold text-slate-900 truncate">{{ activity.title }}</p>
                    <p class="text-[11px] md:text-xs text-slate-500 line-clamp-1 leading-relaxed">{{ activity.desc }}</p>
                  </div>
                </div>
                <span class="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0 ml-4">
                  {{ activity.time | date:'shortTime' }}
                </span>
              </div>
            </div>
          </div>

          <!-- QUICK ACTIONS -->
          <div class="bg-slate-900 rounded-[3rem] p-8 md:p-10 text-white relative overflow-hidden">
            <div class="relative z-10 h-full flex flex-col">
              <h3 class="text-xl md:text-2xl font-display font-bold mb-8">Administrative Actions</h3>
              <div class="space-y-4 flex-1">
                <button (click)="generateReport()" class="w-full p-5 bg-white/5 border border-white/10 rounded-3xl text-left hover:bg-primary-500 transition-all group active:scale-[0.98]">
                  <p class="text-sm font-bold mb-1">Generate Platform Audit</p>
                  <p class="text-[10px] text-slate-400 group-hover:text-white/80 leading-tight">Export full system analytics as a PDF document.</p>
                </button>
                <button (click)="showBroadcastModal.set(true)" class="w-full p-5 bg-white/5 border border-white/10 rounded-3xl text-left hover:bg-orange-500 transition-all group active:scale-[0.98]">
                  <p class="text-sm font-bold mb-1">Broadcast Notification</p>
                  <p class="text-[10px] text-slate-400 group-hover:text-white/80 leading-tight">Send high-priority alerts to NGOs or Volunteers.</p>
                </button>
                <button (click)="refreshStats()" class="w-full p-5 bg-white/5 border border-white/10 rounded-3xl text-left hover:bg-white/10 transition-all group active:scale-[0.98]">
                  <p class="text-sm font-bold mb-1">Sync Real-time Data</p>
                  <p class="text-[10px] text-slate-400 group-hover:text-white/80 leading-tight">Force a full refresh of platform dashboard metrics.</p>
                </button>
              </div>
              <div class="mt-8 pt-8 border-t border-white/10">
                <p class="text-[10px] text-white/30 font-bold uppercase tracking-widest">Admin Authorization Verified</p>
              </div>
            </div>
            <div class="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px]"></div>
          </div>
        </div>
      </div>

      <!-- MODAL (Rendered OUTSIDE the space-y container to avoid top margin issues) -->
      <div *ngIf="showBroadcastModal()" class="fixed inset-0 z-[9999] overflow-y-auto">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-md" (click)="showBroadcastModal.set(false)"></div>
        
        <!-- Modal Scroll Container -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up">
            <!-- Modal Header -->
            <div class="p-6 md:p-8 border-b border-slate-50 bg-slate-50/50">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center text-lg shadow-lg shadow-orange-500/20">
                    <i class="fas fa-broadcast-tower"></i>
                  </div>
                  <div>
                    <h3 class="text-lg font-display font-bold text-slate-900">Broadcast Alert</h3>
                    <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Platform-wide Message</p>
                  </div>
                </div>
                <button (click)="showBroadcastModal.set(false)" class="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>

            <!-- Modal Body -->
            <div class="p-6 md:p-8 space-y-4">
              <div class="space-y-1.5">
                <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Urgent Title</label>
                <input type="text" [(ngModel)]="broadcastForm.title" placeholder="e.g. Critical Server Maintenance" 
                       class="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-orange-500 transition-all outline-none text-xs font-bold text-slate-900">
              </div>

              <div class="space-y-1.5">
                <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Message Body</label>
                <textarea [(ngModel)]="broadcastForm.message" rows="4" placeholder="Type announcement here..."
                          class="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-orange-500 transition-all outline-none text-xs font-medium text-slate-600 leading-relaxed resize-none"></textarea>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Target Role</label>
                  <select [(ngModel)]="broadcastForm.target" class="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-xl outline-none text-[10px] font-bold text-slate-900 focus:border-orange-500 transition-all appearance-none">
                    <option value="all">Everyone</option>
                    <option value="ngo">NGO Partners</option>
                    <option value="volunteer">Volunteers</option>
                  </select>
                </div>
                <div class="space-y-1.5">
                  <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Urgency</label>
                  <select [(ngModel)]="broadcastForm.type" class="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-xl outline-none text-[10px] font-bold text-slate-900 focus:border-orange-500 transition-all appearance-none">
                    <option value="broadcast">Standard</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="p-6 md:p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-4">
              <button (click)="showBroadcastModal.set(false)" class="text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest">Discard</button>
              <button (click)="submitBroadcast()" 
                      class="px-8 py-3.5 bg-slate-900 text-white text-[10px] font-bold rounded-xl hover:bg-orange-500 transition-all shadow-lg flex items-center gap-2 active:scale-95 uppercase tracking-widest">
                <span>Send Now</span>
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
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
