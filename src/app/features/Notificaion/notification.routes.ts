import { Routes } from '@angular/router';

export const NOTIFICATION_ROUTES: Routes = [
  {
    path: 'MainNotificaion',
    loadComponent: () =>
      import('./pages/notificaion/notificaion.component').then(
        (m) => m.NotificaionComponent,
      ),
    title: 'الاشعارات',
    data: {
      title: 'إدارة الاشعارات',
      subtitle: 'إرسال إشعارات للعملاء',
    },
  },
];
