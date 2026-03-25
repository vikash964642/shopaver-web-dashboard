import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LandingService {
  private baseUrl = `${environment.baseUrl}/SupportMarketingDashBoard`;

  constructor(private http: HttpClient) {}

  // =============================
  // LANDING PAGE
  // =============================

  addLandingPage(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/AddLandingPage`, payload);
  }

  updateLandingPage(slug: string, payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/UpdateLandingPage?slug=${slug}`, payload);
  }

  getLandingPageBySlug(slug: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/GetLandingPageBySlug?slug=${slug}`,{});
  }

  deleteLandingPage(slug: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/DeleteLandingPage?slug=${slug}`, {});
  }


getSlugList(payload: { search: string; page: string; pageSize: string }) {
  return this.http.post(
    `${this.baseUrl}/GetSlugList`,
    payload
  );
}

  // =============================
  // IMAGE UPLOAD
  // =============================

  uploadBannerImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.baseUrl}/UploadBannerImage`, formData);
  }

  uploadAllInOneImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.baseUrl}/UploadAllInOneImage`, formData);
  }

  uploadMerchantImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.baseUrl}/UploadMerchantImage`, formData);
  }

  // =============================
  // FAQ
  // =============================

  addFAQ(payload: any) {
    return this.http.post(`${this.baseUrl}/AddFAQ`, payload);
  }

  updateFAQ(payload: any) {
    return this.http.post(`${this.baseUrl}/UpdateFAQ`, payload);
  }

  getFAQBySlug(slug: string) {
    return this.http.post(`${this.baseUrl}/GetALLFAQbySlug?slug=${slug}`, {});
  }

  // deleteFAQ(id: number) {
  //   return this.http.delete(`${this.baseUrl}/DeleteFAQ?id=${id}`);
  // }

  // =============================
  //All Slug Data
  // =============================

  getAllSlugData(payload: any) {
    return this.http.post(`${this.baseUrl}/GetScheduleBySlug`, payload );
  }



}
