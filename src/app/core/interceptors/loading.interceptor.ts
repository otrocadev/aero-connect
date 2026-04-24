import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';


export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('loadingInterceptor');

  const loadingService = inject(LoadingService);

  if (req.method !== 'POST') {
    return next(req);
  }

  const loadingId = loadingService.show();

  return next(req).pipe(
    finalize(() => {
      // Hide loading when request completes (success or error)
      loadingService.hide(loadingId);
    })
  );
};
