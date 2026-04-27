import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { GoBackDirective } from '../../../../shared/directive/go-back.directive';
import { DatePipe } from '@angular/common';
import { FlightSearchService } from '../../services/flight-search.service';

@Component({
  selector: 'app-results-header',
  imports: [MatIcon, GoBackDirective, DatePipe ],
  templateUrl: './results-header.component.html',
  styleUrl: './results-header.component.scss'
})
export class ResultsHeaderComponent {
  private _flightSearch = inject(FlightSearchService);

  searchParams = this._flightSearch.searchParams;
}
