import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VolunteerService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/volunteers`;

  getStats() {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  getTasks() {
    return this.http.get<any>(`${this.apiUrl}/tasks`);
  }

  completeTask(id: string) {
    return this.http.patch<any>(`${this.apiUrl}/tasks/${id}/complete`, {});
  }

  getCertificates() {
    return this.http.get<any>(`${this.apiUrl}/certificates`);
  }

  getActivityHistory() {
    return this.http.get<any>(`${this.apiUrl}/history`);
  }
}
