import { Routes } from '@angular/router';
import { PropertyBookingsComponent } from './property-bookings/property-bookings.component';

export const OWNER_PROPERTIES_BOOKING_ROUTES: Routes = [
  {
    path: '',
    component: PropertyBookingsComponent,
    data: { title: 'حجوزاتي', subtitle: 'إدارة حجوزات عقاراتك' },
  },
];
