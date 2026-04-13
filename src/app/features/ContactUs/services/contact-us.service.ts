import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ContactUs, ContactUsApiResponse } from '../models/contact-us.model';

@Injectable({ providedIn: 'root' })
export class ContactUsService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/api/dashboard/contact-us';

  get(): Observable<ContactUs> {
    return this.api
      .get<ContactUsApiResponse>(this.endpoint)
      .pipe(map((res) => res.data));
  }

  update(body: ContactUs): Observable<void> {
    return this.api
      .put<any>(this.endpoint, body)
      .pipe(map(() => undefined));
  }
}
