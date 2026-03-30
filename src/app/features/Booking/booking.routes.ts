import { Routes } from '@angular/router';

export const BOOKING_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'mainBooking',
    pathMatch: 'full',
  },
  {
    path: 'mainBooking',
    loadComponent: () =>
      import('./pages/booking/booking.component').then(
        (m) => m.BookingComponent,
      ),
    title: 'الحجوزات',
    data: {
      title: 'إدارة الحجوزات',
      subtitle: ' متابعة وادارة الحجوزات',
    },
  },
];
