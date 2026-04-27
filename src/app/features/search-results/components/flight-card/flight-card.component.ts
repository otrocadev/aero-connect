import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { Flight } from '../../../../core/models/flight.model';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-flight-card',
  imports: [ StatusBadgeComponent, MatIcon, MatButton, DatePipe, CurrencyPipe],
  templateUrl: './flight-card.component.html',
  styleUrl: './flight-card.component.scss'
})
export class FlightCardComponent {
  @Input() flight!: Flight;
  @Output() onFlightSelected: EventEmitter<Flight> = new EventEmitter();

  bookFlight(): void {
    this.onFlightSelected.emit(this.flight);
  }

  formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  }
}
