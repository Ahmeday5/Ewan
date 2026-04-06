import { Routes } from '@angular/router';

export const PROPERTIES_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'mainProperties',
    pathMatch: 'full',
  },
  {
    path: 'mainProperties',
    loadComponent: () =>
      import('./pages/Properties/Properties.component').then(
        (m) => m.PropertiesComponent,
      ),
    title: 'العقارات',
    data: {
      title: 'إدارة العقارات',
      subtitle: 'إضافة وتعديل وحذف العقارات',
    },
  },
];
