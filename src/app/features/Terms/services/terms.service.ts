import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Terms, TermsApiResponse } from '../models/terms.model';

@Injectable({ providedIn: 'root' })
export class TermsService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/api/dashboard/terms-and-conditions';

  get(): Observable<Terms> {
    return this.api
      .get<TermsApiResponse>(this.endpoint)
      .pipe(map((res) => res.data));
  }

  update(content: string): Observable<void> {
    return this.api
      .put<any>(this.endpoint, { content })
      .pipe(map(() => undefined));
  }
}
