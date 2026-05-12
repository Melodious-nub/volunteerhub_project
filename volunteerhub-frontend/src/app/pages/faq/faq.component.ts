import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-wrapper min-h-screen bg-slate-50">
      <!-- HERO -->
      <div class="bg-slate-900 py-32 text-white relative overflow-hidden">
        <div class="container mx-auto px-6 relative z-10 text-center">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary-400 text-[10px] font-bold uppercase tracking-widest mb-6">
            Help Center
          </div>
          <h1 class="text-4xl md:text-6xl font-display font-extrabold mb-8 tracking-tight">Common <span class="text-primary-500">Inquiries</span></h1>
          <p class="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about the platform. Can't find what you're looking for? 
            <a routerLink="/contact" class="text-primary-400 hover:text-primary-300 underline underline-offset-4 decoration-primary-500/30 transition-all font-bold">Connect with support</a>.
          </p>
        </div>
        
        <!-- Decorative Elements -->
        <div class="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        <div class="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"></div>
      </div>

      <!-- FAQ LIST -->
      <div class="container mx-auto px-6 py-24">
        <div class="max-w-3xl mx-auto space-y-6">
          <div *ngFor="let faq of faqs; let i = index" 
               class="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
            <button (click)="toggle(i)" 
                    class="w-full px-10 py-8 flex items-center justify-between text-left">
              <span class="text-lg font-bold text-slate-900 transition-colors group-hover:text-primary-500 leading-tight pr-6">{{ faq.q }}</span>
              <div class="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 transition-all duration-300"
                   [class.rotate-180]="openIndex() === i" [class.bg-primary-500]="openIndex() === i" [class.text-white]="openIndex() === i" [class.shadow-lg]="openIndex() === i" [class.shadow-primary-500/20]="openIndex() === i">
                <i class="fas fa-chevron-down text-[10px]"></i>
              </div>
            </button>
            <div *ngIf="openIndex() === i" class="px-10 pb-10 animate-in">
              <div class="pt-8 border-t border-slate-50">
                <p class="text-slate-500 leading-relaxed text-sm lg:text-base">
                  {{ faq.a }}
                </p>
              </div>
            </div>
          </div>
          
          <!-- CTA -->
          <div class="mt-20 p-10 bg-white rounded-[3rem] border border-slate-100 shadow-sm text-center">
            <h4 class="text-2xl font-display font-bold text-slate-900 mb-2">Still have questions?</h4>
            <p class="text-slate-500 mb-8">Our dedicated support team is available 24/7 to assist you with any platform-related issues.</p>
            <a routerLink="/contact" class="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all">
              <i class="fas fa-envelope text-primary-400"></i> Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-in { animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class FaqComponent {
  openIndex = signal<number | null>(0);

  faqs = [
    { q: 'How do I register as a volunteer?', a: 'Click the "Get Started" button and select "Volunteer". Fill in your skills and location to start receiving matching opportunities. Once registered, you can track your impact, earn badges, and join local missions instantly.' },
    { q: 'Can I donate anonymously?', a: 'Yes! Our donation workflow is designed for flexibility. You can contribute to any mission without creating an account or revealing your identity publicly. Your impact will still be tracked in our global fund statistics.' },
    { q: 'Is VolunteerHub free for NGOs?', a: 'Absolutely. VolunteerHub is a social impact initiative. Basic registration, campaign hosting, and volunteer management are free for all verified NGOs operating in Bangladesh.' },
    { q: 'How is my donation handled?', a: 'We partner with secure payment gateways like bKash, Nagad, and Rocket. Funds are transferred directly to the verified NGO\'s account. VolunteerHub provides transparency by tracking how much is raised vs the mission\'s target goal.' },
    { q: 'What is the Emergency SOS feature?', a: 'The SOS feature is a rapid-response tool for crisis situations. It broadcasts your GPS coordinates and a situation summary to nearby verified volunteers and designated emergency responders instantly.' }
  ];

  toggle(i: number) {
    this.openIndex.set(this.openIndex() === i ? null : i);
  }
}
