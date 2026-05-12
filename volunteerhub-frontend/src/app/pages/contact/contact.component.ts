import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrapper min-h-screen bg-slate-50">
      <div class="bg-slate-900 py-24 text-white relative overflow-hidden">
        <div class="container mx-auto px-6 relative z-10 text-center">
          <h1 class="text-4xl md:text-6xl font-display font-extrabold mb-6">Get in Touch</h1>
          <p class="text-slate-400 text-lg max-w-2xl mx-auto">
            Have questions about volunteering, donating, or registering your NGO? Our team is here to help 24/7.
          </p>
        </div>
      </div>

      <div class="container mx-auto px-6 py-20">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
          <!-- Info -->
          <div class="space-y-8">
            <div *ngFor="let info of contactInfo" class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
              <div class="w-12 h-12 bg-primary-50 text-primary-500 rounded-xl flex items-center justify-center text-xl mb-4">
                <i [class]="info.icon"></i>
              </div>
              <h4 class="font-bold text-slate-900 mb-1">{{ info.title }}</h4>
              <p class="text-slate-500 text-sm leading-relaxed">{{ info.value }}</p>
            </div>
          </div>

          <!-- Form -->
          <div class="lg:col-span-2 bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100">
            <form (ngSubmit)="submitForm()" #contactForm="ngForm" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="text-sm font-bold text-slate-700 ml-2">Full Name</label>
                  <input type="text" name="name" [(ngModel)]="formData.name" required #name="ngModel"
                         placeholder="John Doe" 
                         class="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none text-sm font-medium">
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-bold text-slate-700 ml-2">Email Address</label>
                  <input type="email" name="email" [(ngModel)]="formData.email" required email #email="ngModel"
                         placeholder="john@example.com" 
                         class="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none text-sm font-medium">
                </div>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-bold text-slate-700 ml-2">Subject</label>
                <select name="subject" [(ngModel)]="formData.subject" required
                        class="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none text-sm font-medium">
                  <option value="" disabled>Select Subject</option>
                  <option>General Inquiry</option>
                  <option>NGO Partnership</option>
                  <option>Emergency Support</option>
                  <option>Volunteer Verification</option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-bold text-slate-700 ml-2">Message</label>
                <textarea name="message" [(ngModel)]="formData.message" required rows="6" 
                          placeholder="How can we help you?" 
                          class="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none text-sm font-medium"></textarea>
              </div>
              <button type="submit" [disabled]="contactForm.invalid || loading()" 
                      class="w-full py-5 bg-primary-500 hover:bg-primary-600 text-white font-extrabold rounded-2xl shadow-xl shadow-primary-500/20 transition-all transform hover:-translate-y-1 disabled:opacity-50">
                {{ loading() ? 'Sending...' : 'Send Message 🚀' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ContactComponent {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);

  loading = signal(false);
  formData = {
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  };

  contactInfo = [
    { icon: 'fas fa-envelope', title: 'Email Us', value: 'hello@volunteerhub.com' },
    { icon: 'fas fa-phone-alt', title: 'Call Us', value: '+880 1234 567890' },
    { icon: 'fas fa-map-marker-alt', title: 'Visit Us', value: 'Dhanmondi 27, Dhaka, Bangladesh' }
  ];

  submitForm() {
    this.loading.set(true);
    this.http.post<any>(`${environment.apiUrl}/contacts`, this.formData).subscribe({
      next: () => {
        this.loading.set(false);
        this.toastr.success('Thank you! Your message has been sent successfully.');
        this.formData = {
          name: '',
          email: '',
          subject: 'General Inquiry',
          message: ''
        };
      },
      error: () => {
        this.loading.set(false);
        this.toastr.error('Failed to send message. Please try again later.');
      }
    });
  }
}
