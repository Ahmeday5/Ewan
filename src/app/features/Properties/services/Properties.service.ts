import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { properties, propertiesResponse } from '../models/Properties.model';
import { map, Observable } from 'rxjs';
import {
  apiResponse,
  postResponse,
} from '../../../core/model/apiResponse.model';

@Injectable({ providedIn: 'root' })
export class PropertiesService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/api/dashboard/properties';

  getAll(pageIndex = 1, pageSize = 10): Observable<propertiesResponse> {
    return this.api
      .get<apiResponse<properties>>(this.endpoint, { pageIndex, pageSize })
      .pipe(
        map((res) => ({
          properties: res.data.data,
          totalPages: res.data.totalPages,
          totalCount: res.data.count,
        })),
      );
  }

  getById(id: number): Observable<properties> {
    return this.api
      .get<{ data: properties }>(`${this.endpoint}/${id}`)
      .pipe(map((res) => res.data));
  }

  create(formData: FormData): Observable<postResponse> {
    return this.api.post<postResponse>(this.endpoint, formData);
  }

  // ✅ الـ update بياخد id في الـ URL وformData في الـ body
  update(id: number, formData: FormData): Observable<postResponse> {
    return this.api.put<postResponse>(`${this.endpoint}`, formData);
  }

  delete(id: number): Observable<postResponse> {
    return this.api.delete<postResponse>(`${this.endpoint}/${id}`);
  }
}
