import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Flight } from '../../core/models/flight.model';
import { FlightService } from '../../core/services/flight.service';
import { BookingService } from '../../core/services/booking.service';
import { CurrencyPipe, DatePipe, JsonPipe } from '@angular/common';
import { map, Observable } from 'rxjs';
import { Validators } from '@angular/forms';

interface PassengerForm {
  firstName: string;
  lastName: string;
  documentType: 'dni' | 'passport';
  documentNumber: string;
}

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    JsonPipe,
  ],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss',
})
export class BookingComponent implements OnInit {
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _bookingService = inject(BookingService);

  flight$: Observable<Flight> = this._route.data.pipe(
    map((data) => data['flight'] as Flight),
  );

  flight: Flight | undefined;
  contactEmail = '';
  isLoadingFlight = false;
  isSubmitting = false;
  error: string | null = null;

  //* Form with a lot of boilerplate (Estaria ben implementat, pero millor usar Formbuilder):
  // bookingForm = new FormGroup({
  //   email: new FormControl(''),
  //   passengersArray: new FormArray([
  //     new FormGroup({
  //       firstName: new FormControl(''),
  //       lastName: new FormControl(''),
  //       documentType: new FormControl('dni'),
  //       documentNumber: new FormControl(''),
  //     }),
  //   ]),
  // });

  //* Form with Formbuilder (a lot simpler and more readable)(Also added validators):
  private bookingFormBuilder = inject(FormBuilder);
  public bookingForm = this.bookingFormBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    passengersArray: this.bookingFormBuilder.array([
      this.bookingFormBuilder.group({
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        documentType: ['dni', Validators.required],
        documentNumber: ['', Validators.required],
      }),
    ]),
  });

  // To be able to add dynamically a new pasenger form into the array
  public addPassengerFormField() {
    this.bookingForm.controls.passengersArray.push(
      new FormGroup({
        firstName: new FormControl(''),
        lastName: new FormControl(''),
        documentType: new FormControl('dni'),
        documentNumber: new FormControl(''),
      }),
    );
  }

  passengers: PassengerForm[] = Array.from(
    { length: Number(this._route.snapshot.queryParams['passengers'] ?? 1) },
    () => ({
      firstName: '',
      lastName: '',
      documentType: 'dni',
      documentNumber: '',
    }),
  );

  get totalPrice(): number {
    return (this.flight?.basePrice ?? 0) * this.passengers.length;
  }

  ngOnInit(): void {
    this.flight$.subscribe((res) => (this.flight = res));
  }

  submit(): void {
    if (!this.flight) return;
    if (!this.bookingForm.valid) {
      this.bookingForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    this.error = null;
    this._bookingService
      .create({
        flightId: this.flight.id,
        passengers: this.passengers.map((p) => ({
          ...p,
          email: this.contactEmail,
        })),
      })
      .subscribe({
        next: (confirmation) => {
          this._router.navigate(['/confirmation'], { state: { confirmation } });
        },
        error: () => {
          this.error =
            'No se ha podido completar la reserva. Inténtalo de nuevo.';
          this.isSubmitting = false;
        },
      });
  }
}
