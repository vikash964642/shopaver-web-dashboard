import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

 login(data: { mobileOrEmail: string; password: string }) {
  return this.http.post<any>(
    `${this.baseUrl}/SupportMarketingDashBoard/Login`,
    data
  ).pipe(
    tap((response) => {

      if (response?.token) {
        localStorage.setItem('authToken', response.token);

        // Optional: Save user info also
        // localStorage.setItem('userData', JSON.stringify(response.data));
      }
    })
  );
}

  getToken() {
    return localStorage.getItem('authToken');
  }

  logout() {
    localStorage.removeItem('authToken');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}