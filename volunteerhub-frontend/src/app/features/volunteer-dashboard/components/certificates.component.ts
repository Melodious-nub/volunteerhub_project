import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VolunteerService } from '../../../core/services/volunteer.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-certificates',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 md:p-10 animate-in">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 class="text-2xl md:text-3xl font-display font-extrabold text-slate-900 mb-2">My Certificates 🎓</h1>
          <p class="text-slate-500 font-medium text-sm md:text-base">Recognition of your hard work and social contributions.</p>
        </div>
        <button (click)="fetchData()" class="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-500/30 transition-all shadow-sm group">
          <i class="fas fa-sync-alt group-hover:rotate-180 transition-transform duration-500"></i>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div *ngFor="let cert of certificates()" class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all h-full flex flex-col">
          <div class="h-48 bg-slate-900 flex items-center justify-center p-8 relative overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
            <div class="relative z-10 w-full h-full border-2 border-emerald-500/30 rounded-xl flex items-center justify-center">
              <i class="fas fa-certificate text-5xl text-emerald-500 group-hover:scale-110 transition-transform"></i>
            </div>
          </div>
          
          <div class="p-8 flex-1 flex flex-col">
            <h3 class="font-display font-bold text-slate-900 text-lg mb-2">{{ cert.name }}</h3>
            <p class="text-slate-500 text-xs mb-6 flex-1 line-clamp-3">{{ cert.description }}</p>
            
            <div class="pt-6 border-t border-slate-50 flex items-center justify-between">
              <div class="flex flex-col">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Issued By</span>
                <span class="text-xs font-bold text-slate-900 truncate max-w-[120px]">{{ cert.issuedBy }}</span>
              </div>
              <button (click)="viewCertificate(cert)" class="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                <i class="fas fa-eye"></i>
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="certificates().length === 0" class="col-span-full py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center">
          <div class="text-6xl mb-6 opacity-30">📜</div>
          <h3 class="text-xl font-display font-bold text-slate-900 mb-2">No Certificates Yet</h3>
          <p class="text-slate-500 text-sm max-w-sm">Certificates are issued by NGOs or Admin upon successful completion of major milestones or missions.</p>
        </div>
      </div>
    </div>

    <!-- CERTIFICATE VIEW MODAL -->
    <div *ngIf="activeCert()" class="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[200] flex flex-col items-center justify-center p-4 md:p-10 animate-in fade-in">
      <div class="absolute top-6 right-6 flex items-center gap-4 z-[210]">
        <button (click)="printCertificate()" class="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all">
          <i class="fas fa-print"></i> Save as PDF
        </button>
        <button (click)="activeCert.set(null)" class="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <!-- THE ACTUAL CERTIFICATE DESIGN -->
      <div id="certificate-print-area" class="w-full max-w-4xl aspect-[1.414/1] bg-white shadow-2xl relative overflow-hidden border-[16px] border-slate-900 p-1 md:p-2">
        <div class="w-full h-full border-4 border-double border-slate-900 p-8 md:p-16 flex flex-col items-center justify-center text-center">
          <!-- Background Decoration -->
          <div class="absolute top-0 left-0 w-64 h-64 border-l-4 border-t-4 border-emerald-500/20"></div>
          <div class="absolute bottom-0 right-0 w-64 h-64 border-r-4 border-b-4 border-emerald-500/20"></div>
          
          <div class="mb-8">
             <div class="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center text-emerald-500 text-4xl mx-auto shadow-xl">
               <i class="fas fa-award"></i>
             </div>
          </div>

          <h4 class="text-emerald-600 font-display font-bold uppercase tracking-[0.3em] text-sm mb-4">Certificate of Achievement</h4>
          <p class="text-slate-400 font-serif italic text-lg mb-8">This is to officially recognize that</p>
          
          <h1 class="text-4xl md:text-6xl font-display font-black text-slate-900 mb-6 underline decoration-emerald-500 decoration-4 underline-offset-8">{{ user()?.name }}</h1>
          
          <p class="text-slate-600 font-medium text-lg max-w-2xl leading-relaxed mb-10">
            Has successfully demonstrated exceptional dedication and social impact through the mission:
            <br>
            <span class="text-slate-900 font-bold">"{{ activeCert().campaign?.title || activeCert().name }}"</span>
          </p>

          <p class="text-slate-500 text-sm max-w-xl mb-16 italic">
            "{{ activeCert().description }}"
          </p>

          <div class="w-full grid grid-cols-2 gap-20 items-end px-12">
            <div class="text-center">
              <div class="border-b-2 border-slate-300 pb-2 mb-2 font-serif text-slate-800 text-xl font-bold">{{ activeCert().issuedBy }}</div>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authorized Signature</p>
            </div>
            <div class="text-center">
              <div class="border-b-2 border-slate-300 pb-2 mb-2 font-serif text-slate-800 text-xl font-bold">{{ activeCert().issueDate | date:'longDate' }}</div>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date of Issue</p>
            </div>
          </div>

          <!-- Logo/Watermark -->
          <div class="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-5">
            <h2 class="text-6xl font-black uppercase tracking-tighter">VolunteerHub</h2>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @media print {
      body * { visibility: hidden; }
      #certificate-print-area, #certificate-print-area * { visibility: visible; }
      #certificate-print-area {
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        border: none !important;
        margin: 0 !important;
        padding: 40px !important;
      }
      .absolute { position: absolute !important; }
    }
  `]
})
export class CertificatesComponent implements OnInit {
  private volunteerService = inject(VolunteerService);
  private authService = inject(AuthService);
  
  certificates = signal<any[]>([]);
  user = this.authService.currentUser;
  activeCert = signal<any | null>(null);

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    this.volunteerService.getCertificates().subscribe({
      next: (res) => {
        this.certificates.set(res.data);
      }
    });
  }

  viewCertificate(cert: any) {
    this.activeCert.set(cert);
  }

  printCertificate() {
    window.print();
  }
}
