import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard, loginGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth/login',
  },
  // 🔹 Auth Layout (Login)
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
      },
    ],
  },

  // 🔹 Main Layout (Dashboard)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(
            (m) => m.DASHBOARD_ROUTES,
          ),
      },
      {
        path: 'properties',
        loadChildren: () =>
          import('./features/realStates/realState.routes').then(
            (m) => m.PROPERTIES_ROUTES,
          ),
      },
      {
        path: 'bookings',
        loadChildren: () =>
          import('./features/Booking/booking.routes').then(
            (m) => m.BOOKING_ROUTES,
          ),
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./features/users/user.routes').then((m) => m.USER_ROUTES),
      },
      {
        path: 'categories',
        loadChildren: () =>
          import('./features/Categoiers/category.routes').then(
            (m) => m.CATEGORY_ROUTES,
          ),
      },
      {
        path: 'Notificaion',
        loadChildren: () =>
          import('./features/Notificaion/notification.routes').then(
            (m) => m.NOTIFICATION_ROUTES,
          ),
      },
      { path: '**', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // 🔹 Fallback
  { path: '**', redirectTo: '/auth/login' },
];
