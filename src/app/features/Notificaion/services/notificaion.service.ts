import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { SendNotificationRequest, SendNotificationResponse } from '../models/notificaion.model';

@Injectable({ providedIn: 'root' })
export class NotificaionService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/api/dashboard/notifications/clients';

  sendToAllClients(payload: SendNotificationRequest): Observable<SendNotificationResponse> {
    return this.api.post<SendNotificationResponse>(this.endpoint, payload);
  }
}
