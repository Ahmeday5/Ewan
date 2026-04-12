import { Routes } from '@angular/router';
import { AdminComponent } from './pages/admin/admin.component';

export const adminRoutes: Routes = [
  {
    path: '',
    redirectTo: 'admin',
    pathMatch: 'full',
  },
  { path: 'admin', component: AdminComponent, title: 'المرافق والخدمات',    data: {
      title: 'إدارة المديرين',
      subtitle: 'إضافة وتعديل وحذف المديرين ',
    }, },
];
