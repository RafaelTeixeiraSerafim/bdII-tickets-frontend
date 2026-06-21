import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/toast/toast.service';

/** Extracts a human message from the API's plain-text error responses. */
export function extractApiError(err: HttpErrorResponse): string {
  if (typeof err.error === 'string' && err.error.trim()) {
    return err.error.trim();
  }
  if (err.error && typeof err.error === 'object' && 'message' in err.error) {
    return String((err.error as { message: unknown }).message);
  }
  if (err.status === 0) {
    return 'Não foi possível conectar à API. Verifique se o servidor está rodando.';
  }
  return err.message || 'Erro inesperado.';
}

/** Surfaces API errors via a toast; 401 redirect is handled by authInterceptor. */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // Let the login form present its own auth error inline.
      const isLogin = req.url.includes('/login');
      if (!isLogin) {
        toast.error(extractApiError(err));
      }
      return throwError(() => err);
    }),
  );
};
