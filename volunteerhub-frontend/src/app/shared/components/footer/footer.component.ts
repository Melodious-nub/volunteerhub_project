import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="bg-slate-950 text-white pt-20 pb-10">
      <div class="container mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <!-- Brand -->
          <div class="space-y-6">
            <a routerLink="/" class="flex items-center gap-3">
              <div class="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">💚</div>
              <div class="text-lg font-display font-bold tracking-tight">Volunteer<span class="text-primary-400">Hub</span></div>
            </a>
            <p class="text-slate-400 text-sm leading-relaxed">
              Bangladesh's leading platform connecting volunteers, donors, and NGOs to create meaningful social impact and respond to emergencies instantly.
            </p>
            <div class="flex items-center gap-4">
              <a href="#" class="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-all"><i class="fab fa-facebook-f"></i></a>
              <a href="#" class="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-sky-500 transition-all"><i class="fab fa-twitter"></i></a>
              <a href="#" class="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-pink-500 transition-all"><i class="fab fa-instagram"></i></a>
            </div>
          </div>

          <!-- Links -->
          <div>
            <h4 class="font-display font-bold text-lg mb-8">Quick Links</h4>
            <ul class="space-y-4">
              <li *ngFor="let link of quickLinks">
                <a [routerLink]="link.path" class="text-slate-400 hover:text-primary-400 text-sm font-medium transition-colors">{{ link.label }}</a>
              </li>
            </ul>
          </div>

          <!-- Organizations -->
          <div>
            <h4 class="font-display font-bold text-lg mb-8">Organizations</h4>
            <ul class="space-y-4">
              <li *ngFor="let link of orgLinks">
                <a [routerLink]="link.path" class="text-slate-400 hover:text-primary-400 text-sm font-medium transition-colors">{{ link.label }}</a>
              </li>
            </ul>
          </div>

          <!-- Newsletter -->
          <div>
            <h4 class="font-display font-bold text-lg mb-8">Newsletter</h4>
            <p class="text-slate-400 text-xs mb-6 leading-relaxed">Get weekly updates on new campaigns and emergency volunteer opportunities.</p>
            <div class="space-y-3">
              <input type="email" placeholder="Your email address" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all">
              <button class="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-primary-500/20">Subscribe</button>
            </div>
          </div>
        </div>

        <div class="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p class="text-slate-500 text-xs font-medium">© 2026 VolunteerHub. All rights reserved. Made with 💚 in Bangladesh.</p>
          <div class="flex items-center gap-6">
            <a href="#" class="text-slate-500 hover:text-white text-[10px] font-bold uppercase tracking-widest">Privacy Policy</a>
            <a href="#" class="text-slate-500 hover:text-white text-[10px] font-bold uppercase tracking-widest">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class FooterComponent {
  quickLinks = [
    { label: 'Browse Campaigns', path: '/campaigns' },
    { label: 'Emergency SOS', path: '/emergency-sos' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact Support', path: '/contact' },
    { label: 'Common Questions', path: '/faq' }
  ];

  orgLinks = [
    { label: 'Register as NGO', path: '/auth/register/ngo' },
    { label: 'Register as Volunteer', path: '/auth/register/volunteer' },
    { label: 'Partner Login', path: '/auth/login' },
    { label: 'Impact Reports', path: '/about' }
  ];
}
