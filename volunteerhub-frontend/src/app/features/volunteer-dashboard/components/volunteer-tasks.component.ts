import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VolunteerService } from '../../../core/services/volunteer.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-volunteer-tasks',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 md:p-10 animate-in">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 class="text-2xl md:text-3xl font-display font-extrabold text-slate-900 mb-2">Active Tasks 📋</h1>
          <p class="text-slate-500 font-medium text-sm md:text-base">Specific assignments for your joined missions.</p>
        </div>
        <div class="flex items-center gap-4">
          <button (click)="fetchTasks()" class="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary-500 hover:border-primary-500/30 transition-all shadow-sm group">
            <i class="fas fa-sync-alt group-hover:rotate-180 transition-transform duration-500"></i>
          </button>
          <div class="px-6 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <span class="w-3 h-3 rounded-full" [ngClass]="tasks().length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'"></span>
            <span class="text-xs font-bold text-slate-900">{{ tasks().length }} Tasks Available</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div *ngFor="let task of tasks()" class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all h-full flex flex-col">
          <div class="p-8 flex-1 flex flex-col">
            <div class="flex items-center justify-between mb-6">
              <span class="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border"
                    [ngClass]="{
                      'bg-red-50 text-red-600 border-red-100': task.priority.toLowerCase() === 'high',
                      'bg-amber-50 text-amber-600 border-amber-100': task.priority.toLowerCase() === 'medium',
                      'bg-blue-50 text-blue-600 border-blue-100': task.priority.toLowerCase() === 'standard'
                    }">
                {{ task.priority }}
              </span>
              <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{{ task.dueDate | date }}</span>
            </div>
            
            <h3 class="font-display font-bold text-slate-900 text-lg mb-2 line-clamp-1">{{ task.title }}</h3>
            <p class="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">{{ task.description }}</p>
            
            <div class="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
              <div class="flex flex-col">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Campaign</span>
                <span class="text-xs font-bold text-slate-900 truncate max-w-[150px]">{{ task.campaign?.title }}</span>
              </div>
              <button *ngIf="task.status === 'pending'" (click)="completeTask(task._id)" 
                      class="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold hover:bg-emerald-600 transition-all">
                Mark Complete
              </button>
              <span *ngIf="task.status === 'completed'" class="text-emerald-500 font-bold text-xs flex items-center gap-1">
                <i class="fas fa-check-circle"></i> Done
              </span>
            </div>
          </div>
        </div>

        <div *ngIf="tasks().length === 0" class="col-span-full py-20 bg-white rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-6">
          <div class="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-3xl mb-6">🏜️</div>
          <h3 class="text-xl font-display font-bold text-slate-900 mb-2">No Tasks Assigned</h3>
          <p class="text-slate-500 text-sm max-w-sm">NGOs haven't assigned you any specific tasks yet. Your impact will grow once you join missions!</p>
        </div>
      </div>
    </div>
  `
})
export class VolunteerTasksComponent implements OnInit {
  private volunteerService = inject(VolunteerService);
  private toastr = inject(ToastrService);
  tasks = signal<any[]>([]);

  ngOnInit(): void {
    this.fetchTasks();
  }

  fetchTasks() {
    this.volunteerService.getTasks().subscribe({
      next: (res) => {
        this.tasks.set(res.data);
      }
    });
  }

  completeTask(id: string) {
    this.volunteerService.completeTask(id).subscribe({
      next: (res) => {
        this.toastr.success('Excellent work! Task marked as completed.');
        this.fetchTasks();
      }
    });
  }
}
