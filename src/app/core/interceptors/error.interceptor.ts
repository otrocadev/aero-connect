import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';

/**
 * HTTP Error Interceptor for standardized API error handling
 *
 * Handles the standardized API response format:
 * {
 *   success: boolean,
 *   data?: any,
 *   error?: {
 *     code: string,
 *     message: string,
 *     details?: string
 *   }
 * }
 *
 * When success is false, displays the error message to the user
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('errorInterceptor');
  return next(req).pipe(
    // Check if the response has success: false
    tap((event: any) => {
      if (event.body && typeof event.body === 'object') {
        // Check for standardized error response
        if (event.body.success === false && event.body.error) {
          const error = event.body.error;
          const message = error.message || 'An error occurred';
          const details = error.details ? `\n${error.details}` : '';

          // Show error notification
          console.error(`${message}${details}`);
        }
      }
    }),
    // Handle HTTP errors (network errors, 404, 500, etc.)
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMessage = `Network error: ${error.error.message}`;
      } else {
        // Backend returned an unsuccessful response code
        if (error.status === 0) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        } else if (error.status === 401) {
          errorMessage = 'Unauthorized. Please log in again.';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (error.status === 404) {
          errorMessage = 'The requested resource was not found.';
        } else if (error.status === 500) {
          errorMessage = 'Internal server error. Please try again later.';
        } else if (error.error?.error) {
          // Try to extract error from standardized response
          const apiError = error.error.error;
          errorMessage = apiError.message || errorMessage;
          if (apiError.details) {
            errorMessage += `\n${apiError.details}`;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
      }

      // Show error notification
      console.error(`${errorMessage}`);

      // Re-throw the error so it can be handled by the calling code if needed
      return throwError(() => error);
    })
  );
};
