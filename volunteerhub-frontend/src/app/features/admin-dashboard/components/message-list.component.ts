import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Root container WITHOUT transform animation to avoid stacking context issues -->
    <div class="p-4 md:p-10 space-y-8">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl md:text-3xl font-display font-extrabold text-slate-900">User Inquiries</h1>
          <p class="text-slate-500 text-sm">Direct communications from the VolunteerHub community.</p>
        </div>
        <div class="px-6 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 w-fit">
          <span class="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></span>
          <span class="text-xs font-bold text-slate-900">{{ messages().length }} Total Messages</span>
        </div>
      </div>

      <div class="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div class="overflow-x-auto custom-scrollbar">
          <table class="w-full text-left min-w-[800px]">
            <thead class="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th class="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sender</th>
                <th class="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Subject & Context</th>
                <th class="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Received</th>
                <th class="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th class="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr *ngFor="let msg of messages()" class="hover:bg-slate-50/50 transition-all group">
                <td class="px-8 py-6">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary-500 group-hover:text-white transition-all">
                      <i class="fas fa-envelope-open-text text-xs"></i>
                    </div>
                    <div>
                      <p class="font-bold text-slate-900 text-sm leading-tight">{{ msg.name }}</p>
                      <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{{ msg.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-6">
                  <span class="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-slate-200">
                    {{ msg.subject }}
                  </span>
                  <p class="text-xs text-slate-500 mt-2 line-clamp-1 italic">"{{ msg.message }}"</p>
                </td>
                <td class="px-8 py-6">
                  <p class="text-xs font-bold text-slate-600">{{ msg.createdAt | date:'mediumDate' }}</p>
                  <p class="text-[9px] text-slate-400 font-bold uppercase">{{ msg.createdAt | date:'shortTime' }}</p>
                </td>
                <td class="px-8 py-6">
                  <span [ngClass]="{
                    'bg-blue-100 text-blue-600': msg.status === 'new',
                    'bg-slate-100 text-slate-500': msg.status === 'read',
                    'bg-emerald-100 text-emerald-600': msg.status === 'replied'
                  }" class="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-current border-opacity-10">
                    {{ msg.status }}
                  </span>
                </td>
                <td class="px-8 py-6 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button (click)="viewMessage(msg)" title="View Details"
                            class="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white shadow-sm">
                      <i class="fas fa-eye text-xs"></i>
                    </button>
                    <button (click)="updateStatus(msg._id, 'replied')" title="Mark as Replied"
                            class="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-slate-50 text-slate-400 hover:bg-emerald-500 hover:text-white shadow-sm">
                      <i class="fas fa-reply text-xs"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div *ngIf="messages().length === 0" class="p-20 text-center">
          <div class="text-5xl mb-6">📬</div>
          <p class="text-slate-500 font-bold">Inbox is empty. No new inquiries.</p>
        </div>
      </div>
    </div>

    <!-- VIEW MODAL - MOVED OUTSIDE ANIMATED CONTAINER TO PREVENT STACKING CONTEXT ISSUES -->
    <div *ngIf="selectedMessage()" class="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 md:p-6 bg-slate-900/80 backdrop-blur-md">
      <div class="bg-white w-full max-w-xl rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-modal-in">
        <!-- Modal Header -->
        <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <h3 class="text-xl font-display font-bold text-slate-900">Inquiry Detail</h3>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 font-mono">#{{ selectedMessage()._id.slice(-8) }}</p>
          </div>
          <button (click)="selectedMessage.set(null)" class="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <!-- Modal Body (Scrollable) -->
        <div class="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">From</label>
              <p class="font-bold text-slate-900 text-sm truncate">{{ selectedMessage().name }}</p>
            </div>
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Email</label>
              <p class="font-bold text-slate-900 text-sm truncate">{{ selectedMessage().email }}</p>
            </div>
          </div>

          <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Subject</label>
            <p class="font-bold text-slate-900 text-sm">{{ selectedMessage().subject }}</p>
          </div>

          <div class="space-y-2">
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Message Content</label>
            <div class="p-6 bg-white rounded-2xl border border-slate-100 text-slate-600 leading-relaxed text-sm whitespace-pre-line shadow-inner min-h-[120px]">
              {{ selectedMessage().message }}
            </div>
          </div>
        </div>
        
        <!-- Modal Footer -->
        <div class="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
          <button (click)="selectedMessage.set(null)" class="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-all order-2 sm:order-1">
            Dismiss
          </button>
          <button (click)="updateStatus(selectedMessage()._id, 'replied'); selectedMessage.set(null)" 
                  class="px-8 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-lg order-1 sm:order-2">
            Mark as Replied
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-modal-in { animation: modalIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes modalIn { 
      from { opacity: 0; transform: translateY(20px) scale(0.98); } 
      to { opacity: 1; transform: translateY(0) scale(1); } 
    }
  `]
})
export class MessageListComponent implements OnInit {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);
  
  messages = signal<any[]>([]);
  selectedMessage = signal<any | null>(null);

  ngOnInit() {
    this.fetchMessages();
  }

  fetchMessages() {
    this.http.get<any>(`${environment.apiUrl}/contacts`).subscribe(res => {
      if (res.success) this.messages.set(res.data);
    });
  }

  viewMessage(msg: any) {
    this.selectedMessage.set(msg);
    if (msg.status === 'new') {
      this.updateStatus(msg._id, 'read', true);
    }
  }

  updateStatus(id: string, status: string, silent = false) {
    this.http.put<any>(`${environment.apiUrl}/contacts/${id}/status`, { status }).subscribe(res => {
      if (res.success) {
        if (!silent) this.toastr.success(`Message marked as ${status}`);
        this.fetchMessages();
      }
    });
  }
}
