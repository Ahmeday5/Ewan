import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/** Protects admin-portal pages — requires a valid admin session. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.getAdminToken()) {
    return true;
  }
  return router.createUrlTree(['/auth/login']);
};

/**
 * Prevents an already-logged-in admin from seeing the admin login page.
 * Owner sessions are ignored here — they belong to a different portal.
 */
export const loginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.getAdminToken()) {
    return router.createUrlTree(['/dashboard']);
  }
  return true;
};
