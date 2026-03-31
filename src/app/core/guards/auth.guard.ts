import { CanActivateFn, Router, Routes } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { AuthLayoutComponent } from '../../layout/auth-layout/auth-layout.component';
import { MainLayoutComponent } from '../../layout/main-layout/main-layout.component';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getAccessToken();

  if (token) {
    return true;
  }
  return router.createUrlTree(['/auth/login']);
};

export const loginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getAccessToken();

  if (token) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
