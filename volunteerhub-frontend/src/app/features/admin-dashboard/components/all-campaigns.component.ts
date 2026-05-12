import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-all-campaigns',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-10 space-y-8 animate-in">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-display font-extrabold text-slate-900">Mission Oversight</h1>
          <p class="text-slate-500 text-sm">Monitoring and managing all humanitarian efforts across the platform.</p>
        </div>
        <div class="px-6 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <span class="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></span>
          <span class="text-xs font-bold text-slate-900">{{ campaigns().length }} Total Missions</span>
        </div>
      </div>

      <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th class="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Mission & NGO</th>
                <th class="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Funding Status</th>
                <th class="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Deployment</th>
                <th class="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th class="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr *ngFor="let camp of campaigns()" class="hover:bg-slate-50/50 transition-all group">
                <td class="px-8 py-6">
                  <div class="flex items-center gap-4">
                    <img [src]="camp.image" class="w-14 h-14 rounded-2xl object-cover shadow-sm">
                    <div>
                      <p class="font-bold text-slate-900 text-sm leading-tight mb-1">{{ camp.title }}</p>
                      <p class="text-[10px] text-primary-600 font-bold uppercase tracking-widest">{{ camp.ngo?.name }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-6">
                  <div class="space-y-2 max-w-[150px]">
                    <div class="flex items-center justify-between text-[10px] font-bold">
                      <span class="text-slate-400">৳{{ camp.raisedAmount.toLocaleString() }}</span>
                      <span class="text-primary-500">{{ getPercent(camp) }}%</span>
                    </div>
                    <div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div class="h-full bg-primary-500" [style.width.%]="getPercent(camp)"></div>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-6">
                  <p class="text-xs font-bold text-slate-600">{{ camp.volunteersJoined.length }} / {{ camp.volunteersRequired }} Vol.</p>
                  <p class="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{{ camp.location }}</p>
                </td>
                <td class="px-8 py-6">
                  <span [ngClass]="{
                    'bg-emerald-100 text-emerald-600': camp.status === 'active',
                    'bg-slate-100 text-slate-500': camp.status === 'completed',
                    'bg-red-100 text-red-600': camp.status === 'cancelled'
                  }" class="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-current border-opacity-10">
                    {{ camp.status }}
                  </span>
                </td>
                <td class="px-8 py-6 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button (click)="toggleStatus(camp)" [title]="camp.status === 'active' ? 'Mark Completed' : 'Activate'"
                            class="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-slate-50 text-slate-400 hover:bg-primary-500 hover:text-white shadow-sm">
                      <i class="fas" [class.fa-check-circle]="camp.status === 'active'" [class.fa-play-circle]="camp.status !== 'active'"></i>
                    </button>
                    <button (click)="deleteCampaign(camp._id)" title="Remove Mission"
                            class="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white shadow-sm">
                      <i class="fas fa-trash-alt text-xs"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div *ngIf="campaigns().length === 0" class="p-20 text-center">
          <div class="text-5xl mb-6">📢</div>
          <p class="text-slate-500 font-bold">No missions have been launched yet.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-in { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes slideUp { 
      from { opacity: 0; transform: translateY(20px); } 
      to { opacity: 1; transform: translateY(0); } 
    }
  `]
})
export class AllCampaignsComponent implements OnInit {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);
  campaigns = signal<any[]>([]);

  ngOnInit() {
    this.fetchCampaigns();
  }

  fetchCampaigns() {
    this.http.get<any>(`${environment.apiUrl}/admin/campaigns`).subscribe(res => {
      if (res.success) this.campaigns.set(res.data);
    });
  }

  toggleStatus(camp: any) {
    const newStatus = camp.status === 'active' ? 'completed' : 'active';
    this.http.put<any>(`${environment.apiUrl}/admin/campaigns/${camp._id}`, { status: newStatus }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.info(`Mission status updated to ${newStatus}`);
          this.fetchCampaigns();
        }
      },
      error: () => this.toastr.error('Failed to update status')
    });
  }

  deleteCampaign(id: string) {
    if (!confirm('Are you sure you want to delete this mission? This cannot be undone.')) return;
    
    this.http.delete<any>(`${environment.apiUrl}/admin/campaigns/${id}`).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.warning('Mission deleted from platform');
          this.fetchCampaigns();
        }
      },
      error: () => this.toastr.error('Failed to delete mission')
    });
  }

  getPercent(c: any) {
    if (!c.goalAmount) return 0;
    return Math.min(100, Math.floor((c.raisedAmount / c.goalAmount) * 100));
  }
}
