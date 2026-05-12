import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'volunteer' | 'ngo' | 'admin';
  avatar?: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.loadUser();
  }

  register(userData: any) {
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
      tap(res => {
        if (res.success) {
          // Registration successful, might not auto-login depending on flow
        }
      })
    );
  }

  login(credentials: any) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.success) {
          const userData = res.data;
          const user: User = {
            ...userData,
            id: userData._id || userData.id,
            token: res.token
          };
          this.setUser(user);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('vh_user');
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  private setUser(user: User) {
    localStorage.setItem('vh_user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  private loadUser() {
    const savedUser = localStorage.getItem('vh_user');
    if (savedUser) {
      this.currentUser.set(JSON.parse(savedUser));
    }
  }

  get isAuthenticated(): boolean {
    return !!this.currentUser();
  }

  hasRole(role: string): boolean {
    return this.currentUser()?.role === role;
  }
}
