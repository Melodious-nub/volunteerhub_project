import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-ngo-list',
  standalone: true,
  imports: [CommonModule, ConfirmModalComponent],
  template: `
    <div class="p-10 space-y-8 animate-in relative">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-display font-extrabold text-slate-900">NGO Partners</h1>
          <p class="text-slate-500 text-sm">Manage registered non-governmental organizations and their access.</p>
        </div>
        <div class="flex items-center gap-4">
          <button (click)="fetchNgos()" class="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary-500 hover:border-primary-500/30 transition-all shadow-sm group">
            <i class="fas fa-sync-alt group-hover:rotate-180 transition-transform duration-500"></i>
          </button>
          <div class="px-6 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <span class="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></span>
            <span class="text-xs font-bold text-slate-900">{{ ngos().length }} Total Registered</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th class="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Organization</th>
                <th class="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Contact Information</th>
                <th class="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Region</th>
                <th class="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Account Status</th>
                <th class="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr *ngFor="let ngo of ngos()" class="hover:bg-slate-50/50 transition-all group">
                <td class="px-8 py-6">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl group-hover:bg-primary-500 group-hover:text-white transition-all">🏢</div>
                    <div>
                      <p class="font-bold text-slate-900">{{ ngo.name }}</p>
                      <p class="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Since {{ ngo.createdAt | date:'MMM yyyy' }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-6">
                  <p class="text-sm font-bold text-slate-700">{{ ngo.email }}</p>
                  <p class="text-xs text-slate-400">{{ ngo.phone || 'No phone provided' }}</p>
                </td>
                <td class="px-8 py-6">
                  <span class="text-xs font-bold text-slate-600">{{ ngo.location || 'Pan-Bangladesh' }}</span>
                </td>
                <td class="px-8 py-6">
                  <span [ngClass]="{
                    'bg-emerald-100 text-emerald-600': ngo.status === 'active',
                    'bg-slate-100 text-slate-500': ngo.status === 'inactive',
                    'bg-red-100 text-red-600': ngo.status === 'suspended'
                  }" class="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-current border-opacity-10">
                    {{ ngo.status }}
                  </span>
                </td>
                <td class="px-8 py-6 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button (click)="toggleStatus(ngo)" [title]="ngo.status === 'active' ? 'Deactivate' : 'Activate'"
                            class="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-slate-50 text-slate-400 hover:bg-primary-500 hover:text-white shadow-sm">
                      <i class="fas" [class.fa-toggle-on]="ngo.status === 'active'" [class.fa-toggle-off]="ngo.status !== 'active'"></i>
                    </button>
                    <button (click)="openDeleteModal(ngo)" title="Remove NGO"
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
        [title]="'Delete NGO Partner'"
        [message]="'Are you sure you want to remove ' + selectedNgo()?.name + '? This action will revoke all access and cannot be undone.'"
        (onConfirm)="deleteNgo()"
        (onCancel)="showDeleteModal.set(false)">
      </app-confirm-modal>
    </div>
  `
})
export class NgoListComponent implements OnInit {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);
  ngos = signal<any[]>([]);
  
  showDeleteModal = signal(false);
  selectedNgo = signal<any>(null);

  ngOnInit() {
    this.fetchNgos();
  }

  fetchNgos() {
    this.http.get<any>(`${environment.apiUrl}/admin/ngos`).subscribe(res => {
      if (res.success) this.ngos.set(res.data);
    });
  }

  toggleStatus(ngo: any) {
    const newStatus = ngo.status === 'active' ? 'inactive' : 'active';
    this.http.put<any>(`${environment.apiUrl}/admin/users/${ngo._id}`, { status: newStatus }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success(`${ngo.name} is now ${newStatus}`);
          this.fetchNgos();
        }
      }
    });
  }

  openDeleteModal(ngo: any) {
    this.selectedNgo.set(ngo);
    this.showDeleteModal.set(true);
  }

  deleteNgo() {
    const id = this.selectedNgo()?._id;
    this.http.delete<any>(`${environment.apiUrl}/admin/users/${id}`).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.warning('NGO deleted successfully');
          this.showDeleteModal.set(false);
          this.fetchNgos();
        }
      }
    });
  }
}
