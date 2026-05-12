import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NgoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ngo`;

  getVolunteers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/volunteers`);
  }

  assignTask(taskData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/tasks`, taskData);
  }

  getTasks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tasks`);
  }

  issueCertificate(certData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/certificates`, certData);
  }

  getCertificates(): Observable<any> {
    return this.http.get(`${this.apiUrl}/certificates`);
  }
}
