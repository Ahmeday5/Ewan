import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  BookingsResponse,
  BookingDetails,
  BookingFilters,
  GetAllBookingsResponse,
  ApiResponse,
} from '../models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/api/dashboard/bookings';

  // ==============================
  // Get All Bookings (مع pagination + filters)
  // ==============================
  getAll(
    pageIndex = 1,
    pageSize = 10,
    filters: BookingFilters = {},
  ): Observable<BookingsResponse> {
    const params: Record<string, any> = { pageIndex, pageSize };

    if (filters.search?.trim())   params['Search']        = filters.search.trim();
    if (filters.status)           params['Status']        = filters.status;
    if (filters.paymentStatus)    params['PaymentStatus'] = filters.paymentStatus;
    if (filters.propertyId)       params['PropertyId']    = filters.propertyId;
    if (filters.fromDate)         params['FromDate']      = filters.fromDate;
    if (filters.toDate)           params['ToDate']        = filters.toDate;

    return this.api
      .get<ApiResponse<GetAllBookingsResponse>>(this.endpoint, params)
      .pipe(
        map((res) => ({
          items:        res.data.bookings.data,
          totalPages:   res.data.bookings.totalPages,
          totalCount:   res.data.bookings.count,
          totalRevenue: res.data.totalRevenue,
          statusTotals: res.data.statusTotals,
        })),
      );
  }

  // ==============================
  // Get Booking By ID (Details)
  // ==============================
  getById(id: number): Observable<BookingDetails> {
    return this.api
      .get<ApiResponse<BookingDetails>>(`${this.endpoint}/${id}`)
      .pipe(map((res) => res.data));
  }
}
