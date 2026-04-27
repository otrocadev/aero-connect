import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResultsHeaderComponent } from "./components/results-header/results-header.component";
import { ResultsListComponent } from "./components/results-list/results-list.component";
import { ResultsSpinnerComponent } from "./components/results-spinner/results-spinner.component";
import { ResultsErrorComponent } from "./components/results-error/results-error.component";
import { ResultsFiltersComponent } from "./components/results-filters/results-filters.component";
import { FlightSearchService } from './services/flight-search.service';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [
    ResultsHeaderComponent,
    ResultsListComponent,
    ResultsSpinnerComponent,
    ResultsErrorComponent,
    ResultsFiltersComponent
  ],
  providers: [
    FlightSearchService
  ],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.scss',
})
export class SearchResultsComponent {
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _flightSearch = inject(FlightSearchService);

  isLoading = this._flightSearch.isLoading;
  error = this._flightSearch.error;


  /*get filteredFlights(): Flight[] {
    let result = [...this.flights];
    if (this.maxPrice !== null) {
      result = result.filter(f => f.basePrice <= this.maxPrice!);
    }
    result.sort((a, b) => {
      if (this.sortBy === 'price') return a.basePrice - b.basePrice;
      if (this.sortBy === 'departure') return a.departureDate.localeCompare(b.departureDate);
      return a.durationMinutes - b.durationMinutes;
    });
    return result;
  }

  ngOnInit(): void {
    const qp = this._route.snapshot.queryParams;
    this.searchParams = {
      origin: qp['origin'] ?? '',
      destination: qp['destination'] ?? '',
      date: qp['date'] ?? '',
      passengers: Number(qp['passengers'] ?? 1),
    };
    this._loadFlights();
  }

  private _loadFlights(): void {
    this.isLoading = true;
    this.error = null;
    this._flightService.search(this.searchParams).subscribe({
      next: (flights) => {
        this.flights = flights;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'No se han podido cargar los vuelos. Inténtalo de nuevo.';
        this.isLoading = false;
      },
    });
  }

  bookFlight(flight: Flight): void {
    this._router.navigate(['/booking', flight.id]);
  }

  */
}
