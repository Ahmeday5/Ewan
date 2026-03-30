import { Routes } from '@angular/router';

export const USER_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'mainUsers',
    pathMatch: 'full',
  },
  {
    path: 'mainUsers',
    loadComponent: () =>
      import('./pages/user/user.component').then((m) => m.UserComponent),
    title: 'المستخدمون',
    data: {
      title: 'إدارة المستخدمين',
      subtitle: ' متابعة وإدارة حسابات المستخدمين',
    },
  },
];
