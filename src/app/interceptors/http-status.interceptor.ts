import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, finalize, throwError } from 'rxjs';
import { SUPPRESS_ERROR_SNACKBAR } from './http-context.tokens';
import { LoadingService } from '../services/loading.service';

export const httpStatusInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  const snackBar = inject(MatSnackBar);
  loadingService.setLoading(true);

  return next(req).pipe(
    finalize(() => loadingService.setLoading(false)),
    catchError((error) => {
      const suppressErrorSnackbar = req.context.get(SUPPRESS_ERROR_SNACKBAR);
      if (!suppressErrorSnackbar) {
        snackBar.open('Something went wrong while fetching data', 'Dismiss', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }
      return throwError(() => error);
    })
  );
};
