import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CampaignService } from '../../../core/services/campaign.service';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-campaigns',
  standalone: true,
  imports: [CommonModule, RouterModule, ConfirmModalComponent, FormsModule],
  template: `
    <div class="p-6 md:p-10 animate-in relative">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 class="text-2xl md:text-3xl font-display font-extrabold text-slate-900">My Campaigns</h1>
          <p class="text-slate-500 font-medium text-sm md:text-base">Manage and track all your active and past social missions.</p>
        </div>
        <div class="flex items-center gap-4 w-full md:w-auto">
          <button (click)="fetchCampaigns()" class="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary-500 hover:border-primary-500/30 transition-all shadow-sm group shrink-0">
            <i class="fas fa-sync-alt group-hover:rotate-180 transition-transform duration-500"></i>
          </button>
          <a routerLink="/ngo/campaigns/create" class="flex-1 md:flex-none px-8 py-4 bg-primary-500 text-white font-bold rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-600 transition-all text-center">
            <i class="fas fa-plus mr-2"></i> New Campaign
          </a>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div *ngFor="let camp of campaigns()" class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all h-full flex flex-col">
          <div class="h-48 relative overflow-hidden shrink-0">
            <img [src]="camp.image || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop'" 
                 class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Cover">
            <!-- Post Progress Update Button Overlay -->
            <button (click)="openUpdateModal(camp)" 
                    title="Post Progress Update"
                    class="absolute bottom-4 right-4 w-10 h-10 bg-emerald-500 text-white rounded-xl shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
              <i class="fas fa-plus-circle"></i>
            </button>
          </div>
          
          <div class="p-8 flex-1 flex flex-col">
            <h3 class="font-display font-bold text-slate-900 text-lg mb-2 line-clamp-1">{{ camp.title }}</h3>
            <div class="flex items-center gap-2 mb-6">
              <span class="px-2 py-0.5 bg-slate-50 text-slate-400 rounded text-[9px] font-bold uppercase tracking-widest border border-slate-100">{{ camp.category }}</span>
              <span class="text-[9px] text-slate-300 font-bold uppercase tracking-widest">•</span>
              <span class="text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate">{{ camp.location }}</span>
            </div>
            
            <div class="space-y-4 mb-8">
              <div>
                <div class="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                  <span class="text-slate-400">Funding Progress</span>
                  <span class="text-emerald-500">{{ getPercent(camp) }}%</span>
                </div>
                <div class="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                  <div class="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-sm shadow-emerald-500/50" [style.width.%]="getPercent(camp)"></div>
                </div>
              </div>
              
              <div class="flex justify-between pt-2">
                <div>
                  <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Raised</p>
                  <p class="text-sm font-bold text-slate-900">৳{{ camp.raisedAmount.toLocaleString() }}</p>
                </div>
                <div class="text-right">
                  <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Goal</p>
                  <p class="text-sm font-bold text-slate-900">৳{{ camp.goalAmount.toLocaleString() }}</p>
                </div>
              </div>
            </div>

            <!-- Campaign Stats -->
            <div class="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6 text-center">
              <div>
                <p class="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Field Logs</p>
                <p class="text-xs font-black text-slate-900">{{ camp.updates?.length || 0 }}</p>
              </div>
              <div>
                <p class="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Volunteers</p>
                <p class="text-xs font-black text-slate-900">{{ camp.volunteersJoined?.length || 0 }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 mt-auto">
              <a [routerLink]="['/ngo/campaigns/edit', camp._id]" 
                 class="py-3.5 bg-slate-900 text-white font-bold rounded-2xl text-xs hover:bg-slate-800 transition-all text-center">Edit Settings</a>
              <button (click)="openDeleteModal(camp)" class="py-3.5 bg-red-50 text-red-500 font-bold rounded-2xl text-xs hover:bg-red-500 hover:text-white transition-all shadow-sm">
                Delete
              </button>
            </div>
          </div>
        </div>

        <!-- EMPTY STATE -->
        <div *ngIf="campaigns().length === 0" class="col-span-full py-20 bg-white rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-6">
          <div class="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-3xl mb-6">🏜️</div>
          <h3 class="text-xl font-display font-bold text-slate-900 mb-2">No Campaigns Yet</h3>
          <p class="text-slate-500 text-sm max-w-sm mb-8">Start your first social mission today and make a real difference in the community.</p>
          <a routerLink="/ngo/campaigns/create" class="px-8 py-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all">
            Launch First Mission
          </a>
        </div>
      </div>

      <!-- ADD UPDATE MODAL -->
      <div *ngIf="showUpdateModal()" class="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" (click)="showUpdateModal.set(false)"></div>
        <div class="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up">
          <div class="p-8 bg-emerald-600 text-white flex items-center justify-between">
            <div>
              <h3 class="text-xl font-display font-black">Mission Progress Log 📋</h3>
              <p class="text-xs text-white/80 font-bold uppercase tracking-widest mt-1">Campaign: {{ selectedCamp()?.title }}</p>
            </div>
            <button (click)="showUpdateModal.set(false)" class="text-white/60 hover:text-white"><i class="fas fa-times"></i></button>
          </div>
          
          <div class="p-8 space-y-6">
            <div class="form-group">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Update Headline</label>
              <input type="text" [(ngModel)]="updateData.title" 
                     class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm font-bold" 
                     placeholder="e.g. Relief Supplies Arrived">
            </div>
            <div class="form-group">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Progress Details</label>
              <textarea [(ngModel)]="updateData.message" rows="4" 
                        class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm font-medium resize-none" 
                        placeholder="Detail the work done on the ground..."></textarea>
            </div>
            
            <button (click)="postUpdate()" [disabled]="!updateData.title || !updateData.message || loading()" 
                    class="w-full py-5 bg-emerald-500 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all disabled:opacity-50">
              {{ loading() ? 'Saving Log...' : 'Add to Public Timeline' }}
            </button>
          </div>
        </div>
      </div>

      <!-- CONFIRM DELETE MODAL -->
      <app-confirm-modal 
        *ngIf="showDeleteModal()"
        [title]="'Delete Mission'"
        [message]="'Are you sure you want to delete this campaign? This action will permanently remove all campaign data and cannot be undone.'"
        (onConfirm)="deleteCampaign()"
        (onCancel)="showDeleteModal.set(false)">
      </app-confirm-modal>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-in { animation: fadeIn 0.5s ease-out; }
    .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class MyCampaignsComponent implements OnInit {
  private campaignService = inject(CampaignService);
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);

  campaigns = signal<any[]>([]);
  showDeleteModal = signal(false);
  showUpdateModal = signal(false);
  selectedCamp = signal<any>(null);
  loading = signal(false);

  updateData = {
    title: '',
    message: ''
  };

  ngOnInit() {
    this.fetchCampaigns();
  }

  fetchCampaigns() {
    const userId = this.authService.currentUser()?.id;
    if (userId) {
      this.campaignService.getCampaigns({ ngo: userId }).subscribe(res => {
        if (res.success) this.campaigns.set(res.data);
      });
    }
  }

  getPercent(camp: any) {
    return Math.min(Math.round((camp.raisedAmount / camp.goalAmount) * 100), 100) || 0;
  }

  openUpdateModal(camp: any) {
    this.selectedCamp.set(camp);
    this.updateData = { title: '', message: '' };
    this.showUpdateModal.set(true);
  }

  postUpdate() {
    const id = this.selectedCamp()?._id;
    if (!id) return;

    this.loading.set(true);
    this.http.post<any>(`${environment.apiUrl}/campaigns/${id}/updates`, this.updateData).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toastr.success('Update posted successfully!');
        this.showUpdateModal.set(false);
        this.fetchCampaigns();
      },
      error: (err) => {
        this.loading.set(false);
        this.toastr.error(err.error?.message || 'Failed to post update');
      }
    });
  }

  openDeleteModal(camp: any) {
    this.selectedCamp.set(camp);
    this.showDeleteModal.set(true);
  }

  deleteCampaign() {
    const id = this.selectedCamp()?._id;
    this.http.delete<any>(`${environment.apiUrl}/campaigns/${id}`).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.warning('Campaign removed successfully');
          this.showDeleteModal.set(false);
          this.fetchCampaigns();
        }
      },
      error: () => this.toastr.error('Failed to delete campaign')
    });
  }
}
