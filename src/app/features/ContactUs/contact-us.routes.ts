import { Routes } from '@angular/router';

export const CONTACT_US_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/contact-us/contact-us.component').then(
        (m) => m.ContactUsComponent,
      ),
    title: 'بيانات التواصل',
    data: { title: 'بيانات التواصل', subtitle: 'تحديث بيانات التواصل مع المستخدمين' },
  },
];
