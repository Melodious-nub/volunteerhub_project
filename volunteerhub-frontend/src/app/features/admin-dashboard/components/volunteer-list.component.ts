import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-volunteer-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-10 space-y-8 animate-in">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-display font-extrabold text-slate-900">Volunteer Network</h1>
          <p class="text-slate-500 text-sm">Managing changemakers across Bangladesh.</p>
        </div>
        <div class="px-6 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <span class="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
          <span class="text-xs font-bold text-slate-900">{{ volunteers().length }} Active Volunteers</span>
        </div>
      </div>

      <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th class="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Volunteer</th>
                <th class="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Expertise & Skills</th>
                <th class="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Account Status</th>
                <th class="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr *ngFor="let vol of volunteers()" class="hover:bg-slate-50/50 transition-all group">
                <td class="px-8 py-6">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-xl group-hover:bg-emerald-500 group-hover:text-white transition-all">
                      {{ vol.name.charAt(0) }}
                    </div>
                    <div>
                      <p class="font-bold text-slate-900">{{ vol.name }}</p>
                      <p class="text-xs text-slate-400">{{ vol.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-6">
                  <div class="flex flex-wrap gap-2">
                    <span *ngFor="let skill of vol.skills" class="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-slate-200">
                      {{ skill }}
                    </span>
                    <span *ngIf="vol.skills.length === 0" class="text-xs text-slate-400 italic">No skills listed</span>
                  </div>
                </td>
                <td class="px-8 py-6">
                  <span [ngClass]="{
                    'bg-emerald-100 text-emerald-600': vol.status === 'active',
                    'bg-red-100 text-red-600': vol.status === 'suspended'
                  }" class="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-current border-opacity-10">
                    {{ vol.status || 'active' }}
                  </span>
                </td>
                <td class="px-8 py-6 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button (click)="toggleStatus(vol)" [title]="vol.status === 'active' ? 'Suspend' : 'Reactivate'"
                            class="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-slate-50 text-slate-400 hover:bg-orange-500 hover:text-white shadow-sm">
                      <i class="fas" [class.fa-user-slash]="vol.status === 'active'" [class.fa-user-check]="vol.status !== 'active'"></i>
                    </button>
                    <button (click)="deleteVolunteer(vol._id)" title="Remove Volunteer"
                            class="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white shadow-sm">
                      <i class="fas fa-trash-alt text-xs"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div *ngIf="volunteers().length === 0" class="p-20 text-center">
          <div class="text-5xl mb-6">🤝</div>
          <p class="text-slate-500 font-bold">No volunteers have registered yet.</p>
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
export class VolunteerListComponent implements OnInit {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);
  volunteers = signal<any[]>([]);

  ngOnInit() {
    this.fetchVolunteers();
  }

  fetchVolunteers() {
    this.http.get<any>(`${environment.apiUrl}/admin/volunteers`).subscribe(res => {
      if (res.success) this.volunteers.set(res.data);
    });
  }

  toggleStatus(vol: any) {
    const newStatus = vol.status === 'active' ? 'suspended' : 'active';
    this.http.put<any>(`${environment.apiUrl}/admin/users/${vol._id}`, { status: newStatus }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.info(`${vol.name} is now ${newStatus}`);
          this.fetchVolunteers();
        }
      },
      error: () => this.toastr.error('Failed to update status')
    });
  }

  deleteVolunteer(id: string) {
    if (!confirm('Are you sure you want to delete this volunteer? This action is permanent.')) return;
    
    this.http.delete<any>(`${environment.apiUrl}/admin/users/${id}`).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.warning('Volunteer removed from platform');
          this.fetchVolunteers();
        }
      },
      error: () => this.toastr.error('Failed to delete volunteer')
    });
  }
}
