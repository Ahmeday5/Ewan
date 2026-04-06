import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { kpisStats } from '../models/dashboard.model';
import { apiResponseWithoutPage } from '../../../core/model/apiResponse.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/api/dashboard/overview';

  constructor() {}

  // ==============================
  // Get Booking Statistics
  // ==============================
  getkpisStats(): Observable<kpisStats> {
    return this.api
      .get<apiResponseWithoutPage<kpisStats>>(`${this.endpoint}/kpis`)
      .pipe(map((res) => res.data));
  }
}
