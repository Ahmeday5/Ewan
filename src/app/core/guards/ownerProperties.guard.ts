import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/** Protects owner-portal pages — requires a valid owner session. */
export const ownerGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.getOwnerToken()) {
    return true;
  }
  return router.createUrlTree(['/ownerProperties/login']);
};

/**
 * Prevents an already-logged-in owner from seeing the owner login page.
 * Admin sessions are ignored here — they belong to a different portal.
 */
export const ownerLoginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.getOwnerToken()) {
    return router.createUrlTree(['/ownerProperties/properties']);
  }
  return true;
};
