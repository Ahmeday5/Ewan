import { Routes } from '@angular/router';

export const TERMS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/terms/terms.component').then((m) => m.TermsComponent),
    title: 'الشروط والأحكام',
    data: { title: 'الشروط والأحكام', subtitle: 'تحرير محتوى الشروط والأحكام' },
  },
];
