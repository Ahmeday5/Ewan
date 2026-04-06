import { Pipe, PipeTransform } from '@angular/core';
import { status, PaymentStatus, paymentMethod } from '../enums/status.enum';

@Pipe({
  name: 'status',
  standalone: true,
})
export class StatusPipe implements PipeTransform {
  transform(
    value: number,
    type: 'status' | 'PaymentStatus' | 'paymentMethod',
  ): { text: string; class: string } {
    const maps = {
      status: {
        [status.Confirmed]: { text: 'مؤكدة', class: 'bg-success' },
        [status.Completed]: { text: 'مكتملة', class: 'bg-primary' },
        [status.Pending]: { text: 'معلقة', class: 'bg-warning' },
        [status.Cancelled]: { text: 'ملغية', class: 'bg-danger' },
      },
      PaymentStatus: {
        [PaymentStatus.Paid]: { text: 'مدفوع', class: 'bg-success' },
        [PaymentStatus.Unpaid]: { text: 'غير مدفوع', class: 'bg-danger' },
      },
      paymentMethod: {
        [paymentMethod.cash]: { text: 'كاش', class: 'bg-success' },
        [paymentMethod.visa]: { text: 'فيزا', class: 'bg-info' },
      },
    };

    return (
      maps[type][value as keyof (typeof maps)[typeof type]] || {
        text: 'غير معروف',
        class: 'bg-secondary',
      }
    );
  }
}
