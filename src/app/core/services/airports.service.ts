import { Airport } from './../models/flight.model';
import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AirportService {
  private http = inject(HttpClient);

  private _airports = signal<Airport[]>([]);
  private _error = signal<Error | null>(null);

  airports = this._airports.asReadonly();

  loadAirports(): Observable<Airport[]> {
    //return this.http.get<any>('api/error/500');
    return this.http.get<Airport[]>('/api/airports').pipe(
      tap(airports => this._airports.set(airports)),
      catchError(error => {
        this._error.set(error);
        return of([]);
      })
    );
  }
}
