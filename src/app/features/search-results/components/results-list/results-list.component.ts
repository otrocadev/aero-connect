import { Component, inject } from '@angular/core';
import { FlightCardComponent } from '../flight-card/flight-card.component';
import { FlightSearchService } from '../../services/flight-search.service';

@Component({
  selector: 'app-results-list',
  imports: [FlightCardComponent],
  templateUrl: './results-list.component.html',
  styleUrl: './results-list.component.scss'
})
export class ResultsListComponent {
  private _flightSearch = inject(FlightSearchService);

  filteredFlights = this._flightSearch.filteredFlights;
}
