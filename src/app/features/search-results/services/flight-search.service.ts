import { Injectable, inject, signal } from '@angular/core';
import { FlightService } from '../../../core/services/flight.service';
import { Flight, SearchParams } from '../../../core/models/flight.model';
import { Observable } from 'rxjs';

@Injectable()
export class FlightSearchService {
  private _flightService = inject(FlightService);

  private _searchParams = signal<SearchParams | null>(null);
  private _maxPrice = signal<number | null>(null);
  private _sortBy = signal<'price' | 'departure' | 'duration'>('price');

  private _flights = signal<Flight[]>([]);
  private _isLoading = signal(false);
  private _error =  signal<string | null>(null);

  searchParams = this._searchParams.asReadonly();
  maxPrice = this._maxPrice.asReadonly();
  sortBy = this._sortBy.asReadonly();
  isLoading = this._isLoading.asReadonly();
  error = this._error.asReadonly();

  filteredFlights = this._flights.asReadonly();

  search(params: SearchParams): void {}

  setMaxPrice(price: number | null): void {
    this._maxPrice.set(price);
  }
  
  setSort(sort: 'price' | 'departure' | 'duration'): void {
    this._sortBy.set(sort);
  }

  loadFlightWithAirports(flightId: string): Observable<[Flight, { code: string; city: string }[]]> {
    throw new Error('Not implemented');
  }
}
