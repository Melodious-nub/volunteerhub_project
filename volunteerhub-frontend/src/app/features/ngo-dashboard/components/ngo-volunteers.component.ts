import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgoService } from '../../../core/services/ngo.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-ngo-volunteers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 md:p-10 space-y-10 animate-in">
      <!-- HEADER -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 class="text-2xl md:text-3xl font-display font-extrabold text-slate-900 mb-2">Manage Volunteers 🤝</h1>
          <p class="text-slate-500 font-medium text-sm md:text-base">Assign tasks and reward your dedicated contributors.</p>
        </div>
      </div>

      <!-- ROW 1: REGISTERED VOLUNTEERS (FULL WIDTH) -->
      <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div class="p-8 border-b border-slate-50 flex items-center justify-between">
          <h3 class="font-display font-bold text-slate-900">Registered Volunteers</h3>
          <div class="flex items-center gap-3">
            <button (click)="fetchData()" class="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary-500 hover:border-primary-500/30 transition-all group">
              <i class="fas fa-sync-alt text-[10px] group-hover:rotate-180 transition-transform duration-500"></i>
            </button>
            <span class="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-[10px] font-bold uppercase tracking-widest">{{ volunteers().length }} Total</span>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Volunteer</th>
                <th class="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Impact Analytics</th>
                <th class="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr *ngFor="let v of volunteers()" class="hover:bg-slate-50/50 transition-colors">
                <td class="px-8 py-6">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center font-bold">
                      {{ v.name.charAt(0) }}
                    </div>
                    <div>
                      <div class="font-bold text-slate-900 text-sm">{{ v.name }}</div>
                      <div class="text-[10px] text-slate-400 font-medium">{{ v.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-6">
                  <div class="flex gap-8">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 text-[10px]">
                        <i class="fas fa-clock"></i>
                      </div>
                      <div>
                        <div class="text-xs font-black text-slate-900 leading-none">{{ v.volunteerHours }}h</div>
                        <div class="text-[8px] text-slate-400 uppercase font-bold tracking-widest">Contributed</div>
                      </div>
                    </div>
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center text-primary-500 text-[10px]">
                        <i class="fas fa-star"></i>
                      </div>
                      <div>
                        <div class="text-xs font-black text-primary-500 leading-none">{{ v.points }}</div>
                        <div class="text-[8px] text-slate-400 uppercase font-bold tracking-widest">Impact Points</div>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-6">
                  <div class="flex items-center justify-center gap-3">
                    <button (click)="openTaskModal(v)" class="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary-600 transition-all active:scale-95 shadow-sm">Assign Task</button>
                    <button (click)="openCertModal(v)" class="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-sm">Issue Award</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ROW 2: HALF AND HALF -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- TASK OVERVIEW (LEFT HALF) -->
        <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div class="p-8 border-b border-slate-50 flex items-center justify-between">
            <h3 class="font-display font-bold text-slate-900">Task Overview</h3>
            <button (click)="fetchData()" class="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-500 hover:border-amber-500/30 transition-all group">
              <i class="fas fa-sync-alt text-[10px] group-hover:rotate-180 transition-transform duration-500"></i>
            </button>
          </div>
          <div class="p-8 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
            <div *ngFor="let task of tasks()" class="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-amber-500/20 transition-all">
              <div class="flex items-center justify-between mb-3">
                <span class="px-2.5 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest border border-current border-opacity-10" 
                      [ngClass]="task.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'">
                  {{ task.status }}
                </span>
                <span class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{{ task.priority }} priority</span>
              </div>
              <h4 class="font-bold text-slate-900 text-sm mb-3 group-hover:text-primary-500 transition-colors">{{ task.title }}</h4>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-5 h-5 bg-slate-200 rounded-lg flex items-center justify-center text-[8px] font-bold">{{ task.volunteer?.name?.charAt(0) }}</div>
                  <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{{ task.volunteer?.name }}</p>
                </div>
                <span class="text-[9px] text-slate-400 font-medium">Due {{ task.dueDate | date:'shortDate' }}</span>
              </div>
            </div>
            <div *ngIf="tasks().length === 0" class="py-20 text-center flex flex-col items-center">
              <div class="text-3xl mb-3 opacity-20">📋</div>
              <p class="text-slate-400 italic text-xs font-medium">No active tasks assigned yet.</p>
            </div>
          </div>
        </div>

        <!-- ISSUED CERTIFICATES (RIGHT HALF) -->
        <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div class="p-8 border-b border-slate-50 flex items-center justify-between">
            <h3 class="font-display font-bold text-slate-900">📜 Issued Certificates</h3>
            <button (click)="fetchData()" class="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-500/30 transition-all group">
              <i class="fas fa-sync-alt text-[10px] group-hover:rotate-180 transition-transform duration-500"></i>
            </button>
          </div>
          <div class="flex-1 overflow-x-auto overflow-y-auto max-h-[400px] custom-scrollbar">
            <table class="w-full text-left">
              <thead class="bg-slate-50/50 sticky top-0 z-10">
                <tr>
                  <th class="px-8 py-5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Recipient</th>
                  <th class="px-8 py-5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Certificate</th>
                  <th class="px-8 py-5 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right">Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr *ngFor="let cert of issuedCertificates()" class="hover:bg-slate-50/50 transition-colors">
                  <td class="px-8 py-5">
                    <div class="text-xs font-bold text-slate-900">{{ cert.volunteer?.name }}</div>
                    <div class="text-[9px] text-slate-400 uppercase tracking-widest">{{ cert.volunteer?.email }}</div>
                  </td>
                  <td class="px-8 py-5">
                    <div class="text-xs font-bold text-slate-700 truncate max-w-[120px]">{{ cert.name }}</div>
                    <div class="text-[9px] text-primary-500 font-bold uppercase tracking-widest">{{ cert.campaign?.title }}</div>
                  </td>
                  <td class="px-8 py-5 text-right">
                    <span class="text-[10px] font-bold text-slate-500">{{ cert.issueDate | date:'mediumDate' }}</span>
                  </td>
                </tr>
                <tr *ngIf="issuedCertificates().length === 0">
                  <td colspan="3" class="px-8 py-20 text-center flex flex-col items-center justify-center">
                    <div class="text-3xl mb-3 opacity-20">📜</div>
                    <p class="text-slate-400 italic text-xs font-medium">No certificates issued yet.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>

    <!-- TASK MODAL -->
    <div *ngIf="showTaskModal()" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div class="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8">
        <div class="p-8 bg-slate-900 text-white flex items-center justify-between">
          <h3 class="font-display font-bold">Assign New Task</h3>
          <button (click)="showTaskModal.set(false)" class="text-white/60 hover:text-white"><i class="fas fa-times"></i></button>
        </div>
        <div class="p-8 space-y-6">
          <div class="space-y-2">
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Task Title</label>
            <input type="text" [(ngModel)]="newTask.title" class="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-primary-500 font-medium text-sm">
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Campaign</label>
            <select [(ngModel)]="newTask.campaignId" class="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-primary-500 font-medium text-sm">
              <option *ngFor="let c of selectedVolunteer()?.joinedCampaigns" [value]="c._id">{{ c.title }}</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority</label>
              <select [(ngModel)]="newTask.priority" class="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-primary-500 font-medium text-sm">
                <option value="standard">Standard</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due Date</label>
              <input type="date" [(ngModel)]="newTask.dueDate" class="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-primary-500 font-medium text-sm">
            </div>
          </div>
          <button (click)="assignTask()" class="w-full py-4 bg-primary-500 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all">Confirm Assignment</button>
        </div>
      </div>
    </div>

    <!-- CERTIFICATE MODAL -->
    <div *ngIf="showCertModal()" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div class="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 border-4 border-emerald-500/20">
        <div class="p-8 bg-emerald-500 text-white flex items-center justify-between">
          <h3 class="font-display font-bold text-lg">Award Recognition 🏆</h3>
          <button (click)="showCertModal.set(false)" class="text-white/60 hover:text-white"><i class="fas fa-times"></i></button>
        </div>
        <div class="p-8 space-y-6">
          <p class="text-xs text-slate-500 font-medium">Issue a digital certificate of appreciation to <b>{{ selectedVolunteer()?.name }}</b> for their outstanding contributions.</p>
          <div class="space-y-2">
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Certificate Name</label>
            <input type="text" [(ngModel)]="newCert.name" placeholder="e.g. Excellence in Service" class="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-emerald-500 font-medium text-sm">
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mission Context</label>
            <select [(ngModel)]="newCert.campaignId" class="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-emerald-500 font-medium text-sm">
              <option *ngFor="let c of selectedVolunteer()?.joinedCampaigns" [value]="c._id">{{ c.title }}</option>
            </select>
          </div>
          <button (click)="issueCert()" class="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all">Issue Digital Certificate</button>
        </div>
      </div>
    </div>
  `
})
export class NgoVolunteersComponent implements OnInit {
  private ngoService = inject(NgoService);
  private toastr = inject(ToastrService);

  volunteers = signal<any[]>([]);
  tasks = signal<any[]>([]);
  issuedCertificates = signal<any[]>([]);
  selectedVolunteer = signal<any>(null);
  showTaskModal = signal(false);
  showCertModal = signal(false);

  newTask = { title: '', description: '', priority: 'standard', dueDate: '', campaignId: '' };
  newCert = { name: '', description: '', campaignId: '' };

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    this.ngoService.getVolunteers().subscribe({
      next: (res) => this.volunteers.set(res.data)
    });
    this.ngoService.getTasks().subscribe({
      next: (res) => this.tasks.set(res.data.slice(0, 5))
    });
    this.ngoService.getCertificates().subscribe({
      next: (res) => this.issuedCertificates.set(res.data)
    });
  }

  openTaskModal(volunteer: any) {
    this.selectedVolunteer.set(volunteer);
    this.showTaskModal.set(true);
  }

  openCertModal(volunteer: any) {
    this.selectedVolunteer.set(volunteer);
    this.showCertModal.set(true);
  }

  assignTask() {
    const data = { ...this.newTask, volunteerId: this.selectedVolunteer()._id };
    this.ngoService.assignTask(data).subscribe({
      next: (res) => {
        this.toastr.success('Task assigned successfully!');
        this.showTaskModal.set(false);
        this.fetchData();
        this.newTask = { title: '', description: '', priority: 'standard', dueDate: '', campaignId: '' };
      }
    });
  }

  issueCert() {
    const data = { ...this.newCert, volunteerId: this.selectedVolunteer()._id };
    this.ngoService.issueCertificate(data).subscribe({
      next: (res) => {
        this.toastr.success('Certificate issued! Points awarded to volunteer.');
        this.showCertModal.set(false);
        this.fetchData(); // Refresh cert list
        this.newCert = { name: '', description: '', campaignId: '' };
      }
    });
  }
}
