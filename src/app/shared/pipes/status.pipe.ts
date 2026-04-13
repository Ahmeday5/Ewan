import { Pipe, PipeTransform } from '@angular/core';
import {
  BookingStatus,
  PaymentStatus,
  PaymentMethod,
} from '../enums/status.enum';

@Pipe({
  name: 'status',
  standalone: true,
})
export class StatusPipe implements PipeTransform {
  transform(
    value: string | number,
    type: 'status' | 'PaymentStatus' | 'paymentMethod',
  ): { text: string; class: string } {
    const maps: Record<string, Record<string | number, { text: string; class: string }>> = {
      status: {
        [BookingStatus.Confirmed]: { text: 'مؤكدة', class: 'bg-success' },
        [BookingStatus.Completed]: { text: 'مكتملة', class: 'bg-primary' },
        [BookingStatus.Pending]: { text: 'معلقة', class: 'bg-warning' },
        [BookingStatus.Cancelled]: { text: 'ملغية', class: 'bg-danger' },
      },
      PaymentStatus: {
        [PaymentStatus.Pending]: { text: 'معلق', class: 'bg-warning' },
        [PaymentStatus.Paid]: { text: 'مدفوع', class: 'bg-success' },
        [PaymentStatus.Failed]: { text: 'فشل', class: 'bg-danger' },
        [PaymentStatus.Refunded]: { text: 'مُسترد', class: 'bg-info' },
      },
      paymentMethod: {
        [PaymentMethod.CashOnArrival]: {
          text: 'كاش عند الوصول',
          class: 'bg-secondary',
        },
      },
    };

    const map = maps[type];
    return (
      map?.[value] ?? {
        text: 'غير معروف',
        class: 'bg-secondary',
      }
    );
  }
}
