import { Component, signal, OnInit, AfterViewInit, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SosService } from '../../core/services/sos.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

declare var L: any;

@Component({
  selector: 'app-emergency-sos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-wrapper min-h-screen bg-slate-900 text-white pb-20">
      <!-- HERO -->
      <section class="relative py-24 overflow-hidden border-b border-white/5">
        <div class="container mx-auto px-6 text-center relative z-10">
          <button (click)="openSosModal()" class="w-48 h-48 bg-red-600 rounded-full mx-auto mb-10 flex flex-col items-center justify-center border-[10px] border-white/10 shadow-[0_0_50px_rgba(220,38,38,0.5)] animate-pulse hover:scale-105 transition-transform cursor-pointer">
            <i class="fas fa-exclamation-triangle text-4xl mb-2"></i>
            <span class="text-3xl font-display font-extrabold">SOS</span>
          </button>
          
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-xs font-bold tracking-widest uppercase mb-8">
            <span class="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            🚨 Emergency Broadcast System Active
          </div>
          
          <h1 class="text-4xl md:text-6xl font-display font-extrabold mb-6 leading-tight">
            One tap can <span class="text-red-400">save a life</span>
          </h1>
          <p class="text-slate-400 max-w-2xl mx-auto text-lg mb-12">
            Share your live location and notify Admin or NGOs instantly. Responders will take immediate action based on your signal.
          </p>

          <div class="flex flex-wrap justify-center gap-4">
            <button (click)="openSosModal()" class="px-10 py-5 bg-white text-red-600 font-extrabold rounded-2xl shadow-xl transition-all hover:bg-slate-50 flex items-center gap-3 text-lg">
              <i class="fas fa-hand-paper"></i> Activate SOS
            </button>
            <a href="tel:999" class="px-10 py-5 bg-white/5 border border-white/20 text-white font-extrabold rounded-2xl hover:bg-white/10 transition-all flex items-center gap-3 text-lg">
              <i class="fas fa-phone-alt"></i> Call 999
            </a>
          </div>
        </div>
      </section>

      <!-- SOS OVERLAY / MODAL (Scrollable Fix) -->
      <div *ngIf="isModalOpen()" class="fixed inset-0 z-[9999] overflow-y-auto">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-slate-950/90 backdrop-blur-sm transition-opacity" (click)="closeSosModal()"></div>
        
        <!-- Modal Scroll Container -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl text-slate-900 overflow-hidden animate-slide-up">
            
            <div *ngIf="!successState()" class="flex flex-col">
              <!-- Header -->
              <div class="bg-red-600 p-8 text-white relative">
                <button (click)="closeSosModal()" class="absolute top-6 right-6 w-10 h-10 bg-black/10 rounded-full flex items-center justify-center hover:bg-black/20 transition-all">
                  <i class="fas fa-times"></i>
                </button>
                <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mb-4">🚨</div>
                <h3 class="text-2xl font-display font-bold">Emergency SOS Alert</h3>
                <p class="text-red-100 text-sm font-medium">Responders will be notified with your location & details.</p>
              </div>

              <!-- Body -->
              <div class="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                
                <!-- NOTIFY OPTION -->
                <div>
                  <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">Who should we notify? *</label>
                  <div class="grid grid-cols-3 gap-3">
                    <button *ngFor="let target of notifyTargets" 
                            (click)="notifiedTo.set(target.id)"
                            [ngClass]="notifiedTo() === target.id ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-slate-50 text-slate-600 border-transparent hover:bg-slate-100'"
                            class="flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all">
                      <i [class]="target.icon" class="text-xl"></i>
                      <span class="text-[9px] font-black uppercase tracking-widest">{{ target.label }}</span>
                    </button>
                  </div>
                </div>

                <!-- EMERGENCY TYPE -->
                <div>
                  <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">Emergency Category *</label>
                  <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <button *ngFor="let type of emergencyTypes" 
                            (click)="selectedType.set(type.name)"
                            [ngClass]="selectedType() === type.name ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-200' : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-red-300'"
                            class="flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all">
                      <span class="text-xl">{{ type.icon }}</span>
                      <span class="text-[8px] font-bold uppercase tracking-wider">{{ type.name }}</span>
                    </button>
                  </div>
                </div>

                <!-- DETAILS -->
                <div class="space-y-4">
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Describe the Situation *</label>
                    <textarea [(ngModel)]="description" rows="3" placeholder="Briefly describe what's happening right now..." 
                              class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-red-500/10 outline-none text-sm font-medium text-slate-600 resize-none"></textarea>
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Your Name (Optional)</label>
                    <input type="text" [(ngModel)]="userName" placeholder="Anonymous" 
                           class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-red-500/10 outline-none text-sm font-medium text-slate-600">
                  </div>
                </div>

                <!-- Location Panel -->
                <div class="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
                  <div class="flex gap-6 mb-4">
                    <button (click)="useMap.set(true)" [ngClass]="useMap() ? 'text-red-600 border-red-600' : 'text-slate-400 border-transparent'" class="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border-b-2 pb-1 transition-all">
                      <i class="fas fa-map-marker-alt"></i> Live GPS Map
                    </button>
                    <button (click)="useMap.set(false)" [ngClass]="!useMap() ? 'text-red-600 border-red-600' : 'text-slate-400 border-transparent'" class="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border-b-2 pb-1 transition-all">
                      <i class="fas fa-edit"></i> Manual Address
                    </button>
                  </div>

                  <div *ngIf="useMap()" class="space-y-4">
                    <div #mapContainer id="sos-map" class="h-48 w-full bg-slate-200 rounded-2xl border border-slate-200 overflow-hidden shadow-inner"></div>
                    <button (click)="detectLocation()" class="w-full py-3 bg-white border border-red-100 text-red-600 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2">
                      <i class="fas fa-crosshairs"></i> Refresh Position
                    </button>
                  </div>

                  <div *ngIf="!useMap()">
                    <input type="text" [(ngModel)]="manualAddress" placeholder="Landmark or Area Name..." class="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-red-500/10 outline-none text-sm font-medium text-slate-600">
                  </div>
                </div>

                <button (click)="submitSos()" [disabled]="loading()" class="w-full py-5 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-red-200 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                  <i class="fas fa-wifi" [class.animate-ping]="loading()"></i>
                  {{ loading() ? 'Broadcasting Alert...' : 'Broadcast SOS Signal' }}
                </button>
                
                <p class="text-[9px] text-slate-400 font-bold text-center uppercase tracking-widest">
                  ⚠️ Alerting authorities with false info is a legal offense.
                </p>
              </div>
            </div>

            <!-- SUCCESS SCREEN (Public View - No Resolve Button) -->
            <div *ngIf="successState()" class="p-12 text-center space-y-8 bg-white h-full flex flex-col justify-center">
              <div class="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-4xl mx-auto shadow-lg animate-bounce">
                <i class="fas fa-broadcast-tower"></i>
              </div>
              <div>
                <h3 class="text-3xl font-display font-black text-slate-900 mb-3 tracking-tighter uppercase">Signal Transmitted ✅</h3>
                <p class="text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">Your emergency data has been broadcasted to <b>{{ notifiedTo() | uppercase }}</b>. Stay where you are and remain visible.</p>
              </div>
              <div class="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div class="flex items-center justify-center gap-3 mb-4">
                  <span class="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Official Responders Notified</span>
                </div>
                <div class="flex flex-wrap justify-center gap-2">
                  <span class="px-3 py-1.5 bg-white border border-slate-100 rounded-lg text-[9px] font-bold text-slate-600 uppercase tracking-widest shadow-sm">Admin Control Room</span>
                  <span class="px-3 py-1.5 bg-white border border-slate-100 rounded-lg text-[9px] font-bold text-slate-600 uppercase tracking-widest shadow-sm">NGO Response Unit</span>
                </div>
              </div>
              <div class="pt-6">
                 <button (click)="closeSosModal()" class="px-10 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl hover:bg-slate-800 transition-all">Return to Home</button>
                 <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-6">Resolution will be handled by the Command Center.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class EmergencySosComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  
  sosService = inject(SosService);
  authService = inject(AuthService);
  toastr = inject(ToastrService);
  
  isModalOpen = signal(false);
  successState = signal(false);
  loading = signal(false);
  useMap = signal(true);
  
  selectedType = signal('');
  notifiedTo = signal('admin');
  userName = '';
  description = '';
  manualAddress = '';
  coordinates: [number, number] = [23.8103, 90.4125]; 
  
  map: any;
  marker: any;

  notifyTargets = [
    { id: 'admin', label: 'Admin Only', icon: 'fas fa-user-shield' },
    { id: 'ngo', label: 'NGOs Only', icon: 'fas fa-building-shield' },
    { id: 'both', label: 'Both', icon: 'fas fa-broadcast-tower' }
  ];

  emergencyTypes = [
    { name: 'Medical', icon: '🏥' },
    { name: 'Accident', icon: '🚗' },
    { name: 'Fire', icon: '🔥' },
    { name: 'Flood', icon: '🌊' },
    { name: 'Others', icon: '⚠️' }
  ];

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) this.userName = user.name;
  }

  ngAfterViewInit(): void {}

  openSosModal() {
    this.isModalOpen.set(true);
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  closeSosModal() {
    this.isModalOpen.set(false);
    this.successState.set(false);
    this.description = '';
    this.selectedType.set('');
  }

  initMap() {
    if (!this.mapContainer || !this.useMap()) return;

    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('sos-map').setView(this.coordinates, 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.marker = L.marker(this.coordinates, { draggable: true }).addTo(this.map);
    
    this.map.on('click', (e: any) => {
      this.coordinates = [e.latlng.lat, e.latlng.lng];
      this.marker.setLatLng(e.latlng);
    });

    this.marker.on('dragend', (e: any) => {
      const position = this.marker.getLatLng();
      this.coordinates = [position.lat, position.lng];
    });

    this.detectLocation();
  }

  detectLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        this.coordinates = [pos.coords.latitude, pos.coords.longitude];
        if (this.map) {
          this.map.setView(this.coordinates, 17);
          this.marker.setLatLng(this.coordinates);
        }
      }, (err) => {
        this.toastr.warning('Location access recommended for precise tracking.');
      });
    }
  }

  submitSos() {
    if (!this.selectedType()) {
      this.toastr.error('Please select emergency type');
      return;
    }
    if (!this.description) {
      this.toastr.error('Please describe the situation');
      return;
    }

    this.loading.set(true);
    const alertData = {
      user: this.authService.currentUser()?.id || null, 
      type: this.selectedType(),
      description: this.description,
      notifiedTo: this.notifiedTo(),
      location: {
        type: 'Point',
        coordinates: [this.coordinates[1], this.coordinates[0]], 
        address: this.useMap() ? 'Pinned on Map' : this.manualAddress
      },
      status: 'pending'
    };

    this.sosService.sendAlert(alertData).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.successState.set(true);
        this.toastr.error('SOS SIGNAL BROADCASTED', 'EMERGENCY ALERT');
      },
      error: (err) => {
        this.loading.set(false);
        this.toastr.error('Transmission failed. Call 999 immediately.');
      }
    });
  }
}
