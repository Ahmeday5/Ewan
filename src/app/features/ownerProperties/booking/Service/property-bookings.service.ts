import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import {
  OwnerBookingsApiResponse,
  OwnerBookingsResponse,
} from '../model/property-bookings.model';

@Injectable({ providedIn: 'root' })
export class PropertyBookingsService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/property-owner/bookings';

  getAll(pageIndex = 1, pageSize = 9): Observable<OwnerBookingsResponse> {
    return this.api
      .get<OwnerBookingsApiResponse>(this.endpoint, { PageIndex: pageIndex, PageSize: pageSize })
      .pipe(
        map((res) => ({
          items: res.data.data,
          totalPages: res.data.totalPages,
          totalCount: res.data.count,
        })),
      );
  }
}
