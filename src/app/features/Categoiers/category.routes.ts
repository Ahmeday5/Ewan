import { Routes } from '@angular/router';

export const CATEGORY_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'mainCategories',
    pathMatch: 'full',
  },
  {
    path: 'mainCategories',
    loadComponent: () =>
      import('./pages/main-category/main-category.component').then(
        (m) => m.MainCategoryComponent,
      ),
    title: 'الفئات',
    data: {
      title: 'إدارة الفئات',
      subtitle: 'إضافة وتعديل وحذف الفئات',
    },
  },
];
