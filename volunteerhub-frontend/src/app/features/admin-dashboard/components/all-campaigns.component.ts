import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-all-campaigns',
  standalone: true,
  imports: [CommonModule, ConfirmModalComponent],
  template: `
    <div class="p-10 space-y-8 animate-in relative">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-display font-extrabold text-slate-900">Campaign Management</h1>
          <p class="text-slate-500 text-sm">Supervising all fundraising and volunteer missions.</p>
        </div>
        <div class="flex items-center gap-4">
          <button (click)="fetchCampaigns()" class="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary-500 hover:border-primary-500/30 transition-all shadow-sm group">
            <i class="fas fa-sync-alt group-hover:rotate-180 transition-transform duration-500"></i>
          </button>
          <div class="px-6 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <span class="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></span>
            <span class="text-xs font-bold text-slate-900">{{ campaigns().length }} Global Missions</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th class="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Mission</th>
                <th class="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">NGO Organizer</th>
                <th class="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Progress</th>
                <th class="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th class="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr *ngFor="let campaign of campaigns()" class="hover:bg-slate-50/50 transition-all group">
                <td class="px-8 py-6">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">📢</div>
                    <div>
                      <p class="font-bold text-slate-900">{{ campaign.title }}</p>
                      <p class="text-[10px] text-primary-500 font-bold uppercase tracking-widest">{{ campaign.category }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-6">
                  <p class="text-sm font-bold text-slate-600">{{ campaign.ngo?.name }}</p>
                </td>
                <td class="px-8 py-6">
                  <div class="w-48">
                    <div class="flex items-center justify-between mb-1.5">
                      <span class="text-[10px] font-bold text-slate-400">{{ getPercent(campaign) }}%</span>
                      <span class="text-[10px] font-bold text-slate-900">৳{{ campaign.raisedAmount.toLocaleString() }}</span>
                    </div>
                    <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div class="h-full bg-primary-500 rounded-full" [style.width.%]="getPercent(campaign)"></div>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-6">
                  <span [ngClass]="{
                    'bg-emerald-100 text-emerald-600': campaign.status === 'active',
                    'bg-blue-100 text-blue-600': campaign.status === 'completed',
                    'bg-slate-100 text-slate-500': campaign.status === 'draft'
                  }" class="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-current border-opacity-10">
                    {{ campaign.status }}
                  </span>
                </td>
                <td class="px-8 py-6 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button (click)="openDeleteModal(campaign)" title="Delete Mission"
                            class="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white shadow-sm">
                      <i class="fas fa-trash-alt text-xs"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <app-confirm-modal 
        *ngIf="showDeleteModal()"
        [title]="'Delete Campaign'"
        [message]="'Are you sure you want to permanently delete the mission: ' + selectedCampaign()?.title + '? All donation history for this mission will be archived.'"
        (onConfirm)="deleteCampaign()"
        (onCancel)="showDeleteModal.set(false)">
      </app-confirm-modal>
    </div>
  `
})
export class AllCampaignsComponent implements OnInit {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);
  campaigns = signal<any[]>([]);

  showDeleteModal = signal(false);
  selectedCampaign = signal<any>(null);

  ngOnInit() {
    this.fetchCampaigns();
  }

  fetchCampaigns() {
    this.http.get<any>(`${environment.apiUrl}/admin/campaigns`).subscribe(res => {
      if (res.success) this.campaigns.set(res.data);
    });
  }

  getPercent(c: any) {
    return Math.min(Math.round((c.raisedAmount / c.goalAmount) * 100), 100) || 0;
  }

  openDeleteModal(campaign: any) {
    this.selectedCampaign.set(campaign);
    this.showDeleteModal.set(true);
  }

  deleteCampaign() {
    const id = this.selectedCampaign()?._id;
    this.http.delete<any>(`${environment.apiUrl}/admin/campaigns/${id}`).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.warning('Campaign deleted successfully');
          this.showDeleteModal.set(false);
          this.fetchCampaigns();
        }
      }
    });
  }
}
