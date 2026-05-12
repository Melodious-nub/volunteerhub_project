import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-wrapper min-h-screen bg-white">
      <!-- HEADER -->
      <div class="bg-slate-900 pt-32 pb-40 text-white relative overflow-hidden">
        <div class="container mx-auto px-6 relative z-10 text-center">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary-400 text-[10px] font-bold uppercase tracking-widest mb-6">
            Our Purpose
          </div>
          <h1 class="text-4xl md:text-7xl font-display font-extrabold mb-8 tracking-tight">Unity for <span class="text-primary-500">Impact</span></h1>
          <p class="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            VolunteerHub is Bangladesh's premier humanitarian network, bridging the gap between passionate hearts and missions that matter.
          </p>
        </div>
        
        <!-- Decorative Elements -->
        <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        <div class="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"></div>
      </div>

      <div class="container mx-auto px-6 py-24 space-y-40">
        <!-- STORY SECTION -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div class="space-y-8 animate-slide-up">
            <div class="w-16 h-2 bg-primary-500 rounded-full"></div>
            <h2 class="text-4xl md:text-5xl font-display font-bold text-slate-900 leading-tight">The ripple effect of <br> <span class="text-primary-500">shared responsibility</span></h2>
            <p class="text-slate-500 text-lg leading-relaxed">
              Founded in 2024, VolunteerHub emerged from a simple observation: during times of crisis, thousands of Bangladeshis wanted to help but lacked a structured, transparent way to connect with verified missions.
            </p>
            <p class="text-slate-500 text-lg leading-relaxed">
              We've built more than just a platform; we've built a trust-based ecosystem where every hour volunteered and every taka donated is a step toward a more resilient nation.
            </p>
            <div class="grid grid-cols-2 gap-10 pt-6">
              <div class="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                <div class="text-4xl font-display font-extrabold text-slate-900 mb-2">12K+</div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Volunteers</p>
              </div>
              <div class="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                <div class="text-4xl font-display font-extrabold text-slate-900 mb-2">85+</div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified NGOs</p>
              </div>
            </div>
          </div>
          <div class="relative group">
            <div class="absolute inset-0 bg-primary-500 rounded-[4rem] rotate-3 transform group-hover:rotate-0 transition-transform duration-700"></div>
            <img src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80" 
                 class="relative z-10 rounded-[4rem] shadow-2xl transform group-hover:-translate-y-2 group-hover:-translate-x-2 transition-all duration-700" 
                 alt="Volunteers at work">
          </div>
        </div>

        <!-- VALUES SECTION -->
        <div class="space-y-16">
          <div class="text-center max-w-2xl mx-auto">
            <h2 class="text-[10px] font-bold text-primary-500 uppercase tracking-[0.3em] mb-4">Our DNA</h2>
            <h3 class="text-4xl font-display font-bold text-slate-900">Foundational Principles</h3>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div *ngFor="let val of values" class="group bg-slate-50 p-12 rounded-[3.5rem] border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500">
              <div class="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl mb-8 shadow-sm group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-white transition-all duration-500">
                {{ val.icon }}
              </div>
              <h4 class="text-2xl font-display font-bold text-slate-900 mb-4">{{ val.title }}</h4>
              <p class="text-slate-500 leading-relaxed">{{ val.desc }}</p>
            </div>
          </div>
        </div>

        <!-- IMPACT BANNER -->
        <div class="bg-slate-900 rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
          <div class="relative z-10">
            <h2 class="text-3xl md:text-5xl font-display font-bold mb-8">Ready to define your legacy?</h2>
            <p class="text-slate-400 mb-12 max-w-xl mx-auto text-lg leading-relaxed">Join the most active humanitarian network in the country and start making a measurable difference today.</p>
            <div class="flex justify-center gap-6">
              <a routerLink="/auth/register/volunteer" class="px-10 py-5 bg-primary-500 hover:bg-primary-600 text-white font-extrabold rounded-2xl transition-all shadow-xl shadow-primary-500/20">Become a Volunteer</a>
            </div>
          </div>
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.1)_0%,transparent_70%)]"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-slide-up { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes slideUp { 
      from { opacity: 0; transform: translateY(30px); } 
      to { opacity: 1; transform: translateY(0); } 
    }
  `]
})
export class AboutComponent {
  values = [
    { icon: '💎', title: 'Radical Integrity', desc: 'Every taka donated and every hour served is tracked with absolute precision, ensuring total accountability to our community.' },
    { icon: '⚡', title: 'Agile Response', desc: 'We leverage technology to mobilize resources in minutes during emergencies, turning good intentions into rapid action.' },
    { icon: '🤝', title: 'Inclusive Service', desc: 'A neutral, borderless platform where the only requirement for participation is the genuine desire to serve humanity.' }
  ];
}
