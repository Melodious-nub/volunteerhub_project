import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div class="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl animate-slide-up">
        <div class="p-8 text-center">
          <div class="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6">
            <i class="fas" [class]="icon"></i>
          </div>
          <h3 class="text-xl font-display font-bold text-slate-900 mb-2">{{ title }}</h3>
          <p class="text-sm text-slate-500 leading-relaxed">{{ message }}</p>
        </div>
        
        <div class="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button (click)="onCancel.emit()" class="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all">
            {{ cancelText }}
          </button>
          <button (click)="onConfirm.emit()" class="flex-1 py-3 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ConfirmModalComponent {
  @Input() title = 'Are you sure?';
  @Input() message = 'This action cannot be undone.';
  @Input() icon = 'fa-exclamation-triangle';
  @Input() confirmText = 'Yes, Delete';
  @Input() cancelText = 'Cancel';

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
}
