import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  Faq,
  FaqCreateRequest,
  FaqListResponse,
  FaqMutationResponse,
  FaqUpdateRequest,
} from '../models/faq.model';

@Injectable({ providedIn: 'root' })
export class FaqService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/api/dashboard/faqs';

  getAll(): Observable<FaqListResponse> {
    return this.api.get<FaqListResponse>(this.endpoint);
  }

  create(payload: FaqCreateRequest): Observable<FaqMutationResponse> {
    return this.api.post<FaqMutationResponse>(this.endpoint, payload);
  }

  update(payload: FaqUpdateRequest): Observable<FaqMutationResponse> {
    return this.api.put<FaqMutationResponse>(this.endpoint, payload);
  }

  delete(id: number): Observable<FaqMutationResponse> {
    return this.api.delete<FaqMutationResponse>(`${this.endpoint}/${id}`);
  }
}
