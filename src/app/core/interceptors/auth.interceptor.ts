import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, from } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  const token = auth.getAccessToken();

  if (
    token &&
    !req.url.includes('/login') &&
    !req.url.includes('/refresh') &&
    !req.url.includes('/logout')
  ) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401) {
        return from(auth.refresh()).pipe(
          switchMap((user) => {
            return next(
              req.clone({
                setHeaders: {
                  Authorization: `Bearer ${user.accessToken}`,
                },
              }),
            );
          }),
          catchError(() => {
            auth.logoutCurrent();
            return throwError(() => err);
          }),
        );
      }

      return throwError(() => err);
    }),
  );
};
