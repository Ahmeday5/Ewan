import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard, loginGuard } from './core/guards/auth.guard';
import { ownerGuard } from './core/guards/ownerProperties.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth/login',
  },

  // Redirect bare /ownerProperties to the owner login page.
  {
    path: 'ownerProperties',
    pathMatch: 'full',
    redirectTo: 'ownerProperties/login',
  },

  // 🔹 Auth Layout (Login) Admin Auth
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

  // 🔹 Owner Auth 🆕
  {
    path: 'ownerProperties',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadChildren: () =>
          import('./features/ownerProperties/auth/ownerAuth.routes').then(
            (m) => m.OWNER_AUTH_ROUTES,
          ),
      },
    ],
  },

  // 🔹 Owner App 🆕
  {
    path: 'ownerProperties',
    component: MainLayoutComponent,
    canActivate: [ownerGuard], // 🔥 guard جديد
    children: [
      {
        path: 'properties',
        loadChildren: () =>
          import('./features/ownerProperties/booking/propertyBookings.routes').then(
            (m) => m.OWNER_PROPERTIES_BOOKING_ROUTES,
          ),
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
          import('./features/Properties/Properties.routes').then(
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
      {
        path: 'admins',
        loadChildren: () =>
          import('./features/Admin/admin.routes').then((m) => m.adminRoutes),
      },
      {
        path: 'faq',
        loadChildren: () =>
          import('./features/FAQ/faq.routes').then((m) => m.FAQ_ROUTES),
      },
      {
        path: 'contact-us',
        loadChildren: () =>
          import('./features/ContactUs/contact-us.routes').then(
            (m) => m.CONTACT_US_ROUTES,
          ),
      },
      {
        path: 'terms',
        loadChildren: () =>
          import('./features/Terms/terms.routes').then((m) => m.TERMS_ROUTES),
      },
      { path: '**', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  
  // 🔹 Fallback
  { path: '**', redirectTo: '/auth/login' },
];
