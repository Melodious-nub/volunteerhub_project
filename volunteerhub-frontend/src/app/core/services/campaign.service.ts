import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Campaign {
  _id?: string;
  title: string;
  category: string;
  location: string;
  description: string;
  shortDescription?: string;
  goalAmount: number;
  raisedAmount: number;
  status: 'active' | 'completed' | 'draft';
  image?: string;
  volunteersRequired: number;
  volunteersJoined: string[];
  startDate: string;
  endDate: string;
  ngo?: any;
  updates?: {
    title: string;
    message: string;
    date: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private apiUrl = `${environment.apiUrl}/campaigns`;

  constructor(private http: HttpClient) {}

  getCampaigns(filters?: any) {
    return this.http.get<any>(this.apiUrl, { params: filters });
  }

  getCampaignById(id: string) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createCampaign(campaignData: any) {
    return this.http.post<any>(this.apiUrl, campaignData);
  }

  updateCampaign(id: string, campaignData: any) {
    return this.http.put<any>(`${this.apiUrl}/${id}`, campaignData);
  }

  joinCampaign(id: string) {
    return this.http.post<any>(`${this.apiUrl}/${id}/join`, {});
  }

  getJoinedCampaigns() {
    return this.http.get<any>(`${this.apiUrl}/joined`);
  }

  donateToCampaign(id: string, donationData: any) {
    return this.http.post<any>(`${environment.apiUrl}/donations`, {
      campaignId: id,
      ...donationData
    });
  }

  getNgoDonations() {
    return this.http.get<any>(`${environment.apiUrl}/donations/ngo`);
  }

  deleteCampaign(id: string) {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
