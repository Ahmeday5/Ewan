import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

import {
  BookingsResponse,
  BookingDetails,
  BookingStats,
  GetAllBookingsResponse,
  ApiResponse,
} from '../models/booking.model';
@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/api/dashboard/bookings';

  // ==============================
  // Get All Bookings (مع pagination)
  // ==============================
  getAll(pageIndex = 1, pageSize = 10): Observable<BookingsResponse> {
    return this.api
      .get<ApiResponse<GetAllBookingsResponse>>(this.endpoint, {
        pageIndex,
        pageSize,
      })
      .pipe(
        map((res) => ({
          items: res.data.bookings.data,
          totalPages: res.data.bookings.totalPages,
          totalCount: res.data.bookings.count,
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

  // ==============================
  // Get Booking Statistics
  // ==============================
  getBookingStats(): Observable<BookingStats> {
    return this.api
      .get<ApiResponse<BookingStats>>(`${this.endpoint}/stats`)
      .pipe(map((res) => res.data));
  }
}
