import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VolunteerService } from '../../../core/services/volunteer.service';

@Component({
  selector: 'app-activity-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 md:p-10 animate-in">
      <div class="mb-10">
        <h1 class="text-2xl md:text-3xl font-display font-extrabold text-slate-900 mb-2">Activity Log 📜</h1>
        <p class="text-slate-500 font-medium text-sm md:text-base">A chronological history of your impact and contributions.</p>
      </div>

      <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div class="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Activity</span>
        </div>
        
        <div class="divide-y divide-slate-50">
          <div *ngFor="let item of activities()" class="p-6 md:p-8 flex items-start gap-6 hover:bg-slate-50 transition-colors group">
            <div class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform shadow-sm border border-slate-100">
              <i [class]="getIcon(item.type)"></i>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                <h4 class="font-bold text-slate-900">{{ item.title }}</h4>
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{{ item.date | date:'mediumDate' }}</span>
              </div>
              <p class="text-slate-500 text-sm leading-relaxed mb-3">{{ item.description }}</p>
              <div class="flex flex-wrap gap-2">
                <span *ngFor="let tag of item.tags" 
                      [ngClass]="{
                        'bg-blue-100 text-blue-600': tag === 'Campaign',
                        'bg-emerald-100 text-emerald-600': tag === 'Donation',
                        'bg-purple-100 text-purple-600': tag === 'Task'
                      }"
                      class="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="activities().length === 0" class="p-20 text-center text-slate-400 italic">
          No activity recorded yet. Join a mission to start your journey!
        </div>
      </div>
    </div>
  `
})
export class ActivityHistoryComponent implements OnInit {
  private volunteerService = inject(VolunteerService);
  activities = signal<any[]>([]);

  ngOnInit(): void {
    this.volunteerService.getActivityHistory().subscribe({
      next: (res) => {
        this.activities.set(res.data);
      }
    });
  }

  getIcon(type: string) {
    switch (type) {
      case 'campaign': return 'fas fa-bullhorn text-blue-500';
      case 'donation': return 'fas fa-heart text-emerald-500';
      case 'task': return 'fas fa-check-double text-purple-500';
      default: return 'fas fa-history text-slate-400';
    }
  }
}
