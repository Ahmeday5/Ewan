import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { map, Observable } from 'rxjs';
import { User, UserResponse } from '../models/user.model';
import { apiResponse } from '../../../core/model/apiResponse.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/api/dashboard/clients';

  getAll(
    pageIndex: number = 1,
    pageSize: number = 10,
  ): Observable<UserResponse> {
    const params: any = {
      pageIndex,
      pageSize,
    };

    return this.api.get<apiResponse<User>>(this.endpoint, params).pipe(
      map((res) => {
        return {
          User: res.data.data,
          totalPages: res.data.totalPages,
          totalCount: res.data.count,
        };
      }),
    );
  }

  activationClient(
    id: number,
    body: { isActive: boolean },
  ): Observable<{ message: string }> {
    return this.api.patch<{ message: string }>(
      `${this.endpoint}/${id}/activation`,
      body,
    );
  }
}
