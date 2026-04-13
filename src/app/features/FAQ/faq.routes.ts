import { Routes } from '@angular/router';

export const FAQ_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'list',
    loadComponent: () =>
      import('./pages/faq/faq.component').then((m) => m.FaqComponent),
    title: 'الأسئلة الشائعة',
    data: {
      title: 'الأسئلة الشائعة',
      subtitle: 'إدارة الأسئلة والأجوبة الشائعة',
    },
  },
];
