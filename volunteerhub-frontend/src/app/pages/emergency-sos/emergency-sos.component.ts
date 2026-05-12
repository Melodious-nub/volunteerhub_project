import { Component, signal, OnInit, AfterViewInit, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SosService } from '../../core/services/sos.service';
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
            🚨 24/7 GPS Tracking Enabled
          </div>
          
          <h1 class="text-4xl md:text-6xl font-display font-extrabold mb-6 leading-tight">
            One tap can <span class="text-red-400">save a life</span>
          </h1>
          <p class="text-slate-400 max-w-2xl mx-auto text-lg mb-12">
            Share your live location, upload photo evidence, and alert nearby volunteers and police instantly.
          </p>

          <div class="flex flex-wrap justify-center gap-4">
            <button (click)="openSosModal()" class="px-10 py-5 bg-white text-red-600 font-extrabold rounded-2xl shadow-xl transition-all hover:bg-slate-50 flex items-center gap-3 text-lg">
              <i class="fas fa-hand-paper"></i> Activate SOS
            </button>
            <a href="tel:999" class="px-10 py-5 bg-white/5 border border-white/20 text-white font-extrabold rounded-2xl hover:bg-white/10 transition-all flex items-center gap-3 text-lg">
              <i class="fas fa-phone-alt"></i> Call 999
            </a>
          </div>

          <div class="mt-16 flex flex-wrap justify-center gap-8 border-t border-white/5 pt-10">
            <a href="tel:999" class="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
              <i class="fas fa-shield-alt text-red-500"></i>
              <span class="font-bold text-sm">Police 999</span>
            </a>
            <a href="tel:10921" class="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
              <i class="fas fa-venus text-pink-500"></i>
              <span class="font-bold text-sm">Women 10921</span>
            </a>
            <a href="tel:16516" class="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
              <i class="fas fa-truck-medical text-blue-500"></i>
              <span class="font-bold text-sm">Ambulance 16516</span>
            </a>
          </div>
        </div>
        <!-- BG Blobs -->
        <div class="absolute top-0 left-0 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2"></div>
      </section>

      <!-- SOS OVERLAY / MODAL -->
      <div *ngIf="isModalOpen()" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in">
        <div class="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] shadow-2xl text-slate-900 flex flex-col relative overflow-hidden">
          
          <div *ngIf="!successState()" class="flex flex-col h-full">
            <!-- Header -->
            <div class="bg-red-600 p-8 text-white relative">
              <button (click)="closeSosModal()" class="absolute top-6 right-6 w-10 h-10 bg-black/10 rounded-full flex items-center justify-center hover:bg-black/20 transition-all">
                <i class="fas fa-times"></i>
              </button>
              <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mb-4">🚨</div>
              <h3 class="text-2xl font-display font-bold">Emergency SOS Alert</h3>
              <p class="text-red-100 text-sm">Responders will be notified with your location & details.</p>
            </div>

            <!-- Body -->
            <div class="p-8 overflow-y-auto flex-1 space-y-6">
              <div>
                <label class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">Select Emergency Type</label>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <button *ngFor="let type of emergencyTypes" 
                          (click)="selectedType.set(type.name)"
                          [ngClass]="selectedType() === type.name ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-200' : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-red-300'"
                          class="flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all group">
                    <span class="text-2xl group-hover:scale-110 transition-transform">{{ type.icon }}</span>
                    <span class="text-[10px] font-bold uppercase tracking-wider">{{ type.name }}</span>
                  </button>
                </div>
              </div>

              <div class="space-y-4">
                <input type="text" [(ngModel)]="userName" placeholder="Your Full Name *" class="w-full px-6 py-4 rounded-2xl bg-slate-100 border-none focus:ring-4 focus:ring-red-500/10 outline-none text-sm font-medium">
                <textarea [(ngModel)]="description" rows="2" placeholder="Describe what's happening right now..." class="w-full px-6 py-4 rounded-2xl bg-slate-100 border-none focus:ring-4 focus:ring-red-500/10 outline-none text-sm font-medium"></textarea>
              </div>

              <!-- Location Panel -->
              <div class="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
                <div class="flex gap-4 mb-4">
                  <button (click)="useMap.set(true)" [ngClass]="useMap() ? 'text-red-600' : 'text-slate-400'" class="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <i class="fas fa-map-marker-alt"></i> Live Map
                  </button>
                  <button (click)="useMap.set(false)" [ngClass]="!useMap() ? 'text-red-600' : 'text-slate-400'" class="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <i class="fas fa-edit"></i> Manual Address
                  </button>
                </div>

                <div *ngIf="useMap()" class="space-y-4">
                  <div #mapContainer id="sos-map" class="h-48 w-full bg-slate-200 rounded-2xl border border-slate-200 overflow-hidden"></div>
                  <button (click)="detectLocation()" class="w-full py-3 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2">
                    <i class="fas fa-crosshairs"></i> Detect My Precise Location
                  </button>
                </div>

                <div *ngIf="!useMap()">
                  <input type="text" [(ngModel)]="manualAddress" placeholder="Enter landmark or area name..." class="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-red-500/10 outline-none text-sm font-medium">
                </div>
              </div>

              <button (click)="submitSos()" [disabled]="loading()" class="w-full py-5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-2xl shadow-xl shadow-red-200 transition-all flex items-center justify-center gap-3">
                <i class="fas fa-paper-plane" [class.animate-bounce]="loading()"></i>
                {{ loading() ? 'Sending Alert...' : 'Send Emergency Alert Now' }}
              </button>
              
              <div class="bg-amber-50 p-4 rounded-2xl text-[10px] text-amber-700 font-bold text-center border border-amber-100">
                ⚠️ FALSE ALERTS ARE A LEGAL OFFENSE. COORDINATES ARE LOGGED.
              </div>
            </div>
          </div>

          <!-- SUCCESS SCREEN -->
          <div *ngIf="successState()" class="p-10 text-center space-y-8">
            <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-4xl mx-auto shadow-lg">
              <i class="fas fa-check-double"></i>
            </div>
            <div>
              <h3 class="text-3xl font-display font-extrabold text-slate-900 mb-2">Alert Transmitted ✅</h3>
              <p class="text-slate-500 font-medium">Your live location has been shared with nearby responders and the police control room. Stay calm and visible.</p>
            </div>
            <div class="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <div class="flex items-center gap-4 mb-4">
                <span class="w-3 h-3 bg-green-500 rounded-full animate-ping"></span>
                <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Responders Notified</span>
              </div>
              <div class="flex flex-wrap justify-center gap-2">
                <span *ngFor="let r of notifiedResponders" class="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-600">{{ r }}</span>
              </div>
            </div>
            <button (click)="markSafe()" class="w-full py-5 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-2xl shadow-xl shadow-green-200 transition-all">
              <i class="fas fa-shield-alt mr-2"></i> I am now safe — Resolve Alert
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class EmergencySosComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  
  sosService = inject(SosService);
  toastr = inject(ToastrService);
  
  isModalOpen = signal(false);
  successState = signal(false);
  loading = signal(false);
  useMap = signal(true);
  
  selectedType = signal('');
  userName = '';
  description = '';
  manualAddress = '';
  coordinates: [number, number] = [23.8103, 90.4125]; // Dhaka default
  
  map: any;
  marker: any;

  emergencyTypes = [
    { name: 'Assault', icon: '🆘' },
    { name: 'Accident', icon: '🚗' },
    { name: 'Harassment', icon: '🚨' },
    { name: 'Fire', icon: '🔥' },
    { name: 'Medical', icon: '🏥' },
    { name: 'Other', icon: '⚠️' }
  ];

  notifiedResponders = ['Police HQ', 'Nearby Volunteers (12)', 'Emergency Medical Service', 'Dhaka Fire Control'];

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // We'll init the map only when the modal opens and map panel is active
  }

  openSosModal() {
    this.isModalOpen.set(true);
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  closeSosModal() {
    this.isModalOpen.set(false);
    this.successState.set(false);
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
        this.toastr.warning('Location permission denied. Please select on map manually.');
      });
    }
  }

  submitSos() {
    if (!this.selectedType()) {
      this.toastr.error('Please select an emergency type');
      return;
    }

    this.loading.set(true);
    const alertData = {
      type: this.selectedType(),
      name: this.userName || 'Anonymous',
      description: this.description,
      location: {
        type: 'Point',
        coordinates: this.coordinates,
        address: this.useMap() ? 'Pinned on Map' : this.manualAddress
      },
      status: 'active'
    };

    this.sosService.sendAlert(alertData).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.successState.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.toastr.error('Failed to send SOS alert. Please try calling 999.');
      }
    });
  }

  markSafe() {
    this.successState.set(false);
    this.isModalOpen.set(false);
    this.toastr.success('Glad to hear you are safe!');
  }
}
