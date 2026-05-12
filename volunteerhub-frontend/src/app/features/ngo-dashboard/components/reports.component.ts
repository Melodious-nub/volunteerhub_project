import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CampaignService } from '../../../core/services/campaign.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-10">
      <h1 class="text-3xl font-display font-extrabold text-slate-900 mb-8">Performance Reports</h1>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 class="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span class="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">📊</span>
            Financial Summary
          </h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
              <span class="text-sm font-bold text-slate-500">Total Funds Raised</span>
              <span class="text-lg font-extrabold text-primary-500">৳{{ totalRaised().toLocaleString() }}</span>
            </div>
            <div class="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
              <span class="text-sm font-bold text-slate-500">Total Target Goal</span>
              <span class="text-lg font-extrabold text-slate-900">৳{{ totalGoal().toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <div class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 class="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span class="w-8 h-8 bg-accent-100 text-accent-600 rounded-lg flex items-center justify-center">👥</span>
            Volunteer Impact
          </h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
              <span class="text-sm font-bold text-slate-500">Total Volunteers Mobilized</span>
              <span class="text-lg font-extrabold text-accent-500">{{ totalVolunteers() }}</span>
            </div>
            <div class="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
              <span class="text-sm font-bold text-slate-500">Average Volunteers / Campaign</span>
              <span class="text-lg font-extrabold text-slate-900">{{ avgVolunteers() }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="p-8 border-b border-slate-50">
          <h3 class="font-bold text-slate-900">Campaign-wise Breakdown</h3>
        </div>
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
            <tr>
              <th class="px-8 py-4">Campaign</th>
              <th class="px-8 py-4">Funds (৳)</th>
              <th class="px-8 py-4">Volunteers</th>
              <th class="px-8 py-4">Efficiency</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr *ngFor="let camp of campaigns()">
              <td class="px-8 py-5 font-bold text-slate-900">{{ camp.title }}</td>
              <td class="px-8 py-5 text-slate-600">{{ camp.raisedAmount.toLocaleString() }}</td>
              <td class="px-8 py-5 text-slate-600">{{ camp.volunteersJoined?.length || 0 }}</td>
              <td class="px-8 py-5">
                <span class="px-2 py-1 bg-green-50 text-green-600 rounded text-[10px] font-bold">High</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ReportsComponent implements OnInit {
  private campaignService = inject(CampaignService);
  private authService = inject(AuthService);
  
  campaigns = signal<any[]>([]);
  totalRaised = signal(0);
  totalGoal = signal(0);
  totalVolunteers = signal(0);
  avgVolunteers = signal(0);

  ngOnInit() {
    const userId = this.authService.currentUser()?.id;
    if (userId) {
      this.campaignService.getCampaigns({ ngo: userId }).subscribe(res => {
        if (res.success) {
          const camps = res.data;
          this.campaigns.set(camps);
          this.totalRaised.set(camps.reduce((acc: number, c: any) => acc + c.raisedAmount, 0));
          this.totalGoal.set(camps.reduce((acc: number, c: any) => acc + c.goalAmount, 0));
          const vols = camps.reduce((acc: number, c: any) => acc + (c.volunteersJoined?.length || 0), 0);
          this.totalVolunteers.set(vols);
          this.avgVolunteers.set(camps.length ? Math.round(vols / camps.length) : 0);
        }
      });
    }
  }
}
