import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AirportService } from '../../core/services/airports.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private _router = inject(Router);
  private _airportService = inject(AirportService);

  origin = '';
  destination = '';
  date: Date | null = null;
  passengers = 1;

  airports = this._airportService.airports;

  search(): void {
    if (!this.origin || !this.destination || !this.date) return;
    const dateStr = this.date.toISOString().split('T')[0];
    this._router.navigate(['/flights'], {
      queryParams: {
        origin: this.origin,
        destination: this.destination,
        date: dateStr,
        passengers: this.passengers,
      },
    });
  }
}
