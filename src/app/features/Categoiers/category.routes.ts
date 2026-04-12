import { Routes } from '@angular/router';

export const CATEGORY_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'facilities',
    pathMatch: 'full',
  },
  {
    path: 'facilities',
    loadComponent: () =>
      import('./pages/facilities/facilities.component').then(
        (m) => m.FacilitiesComponent,
      ),
    title: 'المرافق والخدمات',
    data: {
      title: 'إدارة المرافق والخدمات',
      subtitle: 'إضافة وتعديل وحذف المرافق والخدمات',
    },
  },
];
