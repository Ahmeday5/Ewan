import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { kpisStats, DashboardCharts, DashboardOverviewLists } from '../models/dashboard.model';
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

  // ==============================
  // Get Charts Data
  // ==============================
  getChartsData(months: number): Observable<DashboardCharts> {
    return this.api
      .get<apiResponseWithoutPage<DashboardCharts>>(`${this.endpoint}/charts?months=${months}`)
      .pipe(map((res) => res.data));
  }

  // ==============================
  // Get Overview Lists
  // ==============================
  getOverviewLists(topCount: number, recentCount: number): Observable<DashboardOverviewLists> {
    return this.api
      .get<apiResponseWithoutPage<DashboardOverviewLists>>(
        `${this.endpoint}/lists?topCount=${topCount}&recentCount=${recentCount}`,
      )
      .pipe(map((res) => res.data));
  }
}
