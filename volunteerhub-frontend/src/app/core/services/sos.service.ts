import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface SosAlert {
  _id?: string;
  type: string;
  name: string;
  description: string;
  location: {
    type: string;
    coordinates: [number, number];
    address?: string;
  };
  photo?: string;
  status: 'active' | 'resolved' | 'cancelled';
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SosService {
  private apiUrl = `${environment.apiUrl}/sos`;

  constructor(private http: HttpClient) {}

  sendAlert(alertData: any) {
    return this.http.post<any>(this.apiUrl, alertData);
  }

  getAlerts(filters?: any) {
    return this.http.get<any>(this.apiUrl, { params: filters });
  }

  resolveAlert(id: string) {
    return this.http.put<any>(`${this.apiUrl}/${id}/resolve`, {});
  }
}
