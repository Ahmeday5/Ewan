import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { map, Observable } from 'rxjs';
import { facilitiesGroups, facilitiesGroupsResponse } from '../models/facilities.model';
import { apiResponse, postResponse } from '../../../core/model/apiResponse.model';

@Injectable({
  providedIn: 'root',
})
export class facilitiesService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/api/dashboard/facilities';
  constructor() {}

  // ==========================
  // GET ALL
  // ==========================

  getAll(
    pageIndex: number = 1,
    pageSize: number = 10,
  ): Observable<facilitiesGroupsResponse> {
    const params: any = {
      pageIndex,
      pageSize,
    };

    return this.api
      .get<apiResponse<facilitiesGroups>>(this.endpoint, params)
      .pipe(
        map((res) => {
          return {
            facilities: res.data.data,
            totalPages: res.data.totalPages,
            totalCount: res.data.count,
          };
        }),
      );
  }

  // ==========================
  // GET BY ID
  // ==========================

  getById(id: number): Observable<facilitiesGroups> {
    return this.api
      .get<{ data: facilitiesGroups }>(`${this.endpoint}/${id}`)
      .pipe(
        map((res) => res.data), // 👈 هنا ناخد الجزء اللي فعليًا فيه object الفئة
      );
  }

  // ==========================
  // CREATE
  // ==========================

  create(body: { name: string }): Observable<postResponse> {
    return this.api.post<postResponse>(this.endpoint, body);
  }

  // ==========================
  // UPDATE
  // ==========================

  update(body: { id?: number; name: string }): Observable<{ message: string }> {
    return this.api.put<{ message: string }>(`${this.endpoint}`, body);
  }

  // ==========================
  // DELETE
  // ==========================

  delete(id: number): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`${this.endpoint}/${id}`);
  }
}
