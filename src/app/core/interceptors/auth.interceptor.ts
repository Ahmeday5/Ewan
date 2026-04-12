import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * All endpoints under /api/Auth/ belong to the auth flow.
 * Never attach a session token to them, and never attempt a token
 * refresh when they return 401 (a 401 on login = wrong credentials,
 * not an expired session).
 *
 * Using the base path is safer than matching fragments like '/login'
 * because 'property-owner-login' does not contain '/login' as a
 * standalone fragment.
 */
const AUTH_BASE = '/api/Auth/';

/**
 * URL prefix that identifies property-owner API calls.
 * These use the owner session token; everything else uses the admin token.
 */
const OWNER_API_PREFIX = '/api/property-owner/';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  const isAuthUrl = req.url.includes(AUTH_BASE);
  const isOwnerApi = req.url.includes(OWNER_API_PREFIX);

  // Attach the appropriate Bearer token based on which portal the request belongs to.
  if (!isAuthUrl) {
    const token = isOwnerApi ? auth.getOwnerToken() : auth.getAdminToken();
    if (token) {
      req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }
  }

  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401 && !isAuthUrl) {
        if (isOwnerApi) {
          // Owner tokens cannot be refreshed — force re-login immediately.
          auth.handleOwnerUnauthorized();
          return throwError(() => err);
        }

        // Admin 401 — attempt a token refresh.
        // handleAdminUnauthorized() ensures only ONE /refresh call is in flight
        // regardless of how many concurrent 401s arrive at the same time.
        return auth.handleAdminUnauthorized().pipe(
          switchMap((user) =>
            next(
              req.clone({
                setHeaders: { Authorization: `Bearer ${user.accessToken}` },
              }),
            ),
          ),
          catchError(() => throwError(() => err)),
        );
      }

      return throwError(() => err);
    }),
  );
};
