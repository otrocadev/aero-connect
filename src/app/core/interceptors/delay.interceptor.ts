import { HttpInterceptorFn } from '@angular/common/http';
import { delay} from 'rxjs';

/** retrasa la llamada http para simular tiempo de carga */
export const delayInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('delayInterceptor');
  return next(req).pipe(
    delay(2000)
  );
};
