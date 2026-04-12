import { Routes } from '@angular/router';
import { OwnerLoginComponent } from './owner-login/owner-login.component';
import { ownerLoginGuard } from '../../../core/guards/ownerProperties.guard';

export const OWNER_AUTH_ROUTES: Routes = [
  {
    path: '',
    component: OwnerLoginComponent,
    canActivate: [ownerLoginGuard],
    data: { title: 'تسجيل دخول صاحب العقار', subtitle: 'بوابة أصحاب العقارات' },
  },
];
