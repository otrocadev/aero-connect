import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { UpperCasePipe } from '@angular/common';

import { PassengerBookFacade } from './services/passenger-book.facade';
import { PassengerProfile } from '../../core/models/passenger.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-passenger-book',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDividerModule,
    UpperCasePipe,
  ],
  providers: [PassengerBookFacade],
  templateUrl: './passenger-book.component.html',
  styleUrl: './passenger-book.component.scss',
})
export class PassengerBookComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly facade = inject(PassengerBookFacade);

  // ── FORMULARIOS ───────────────────────────────────────────────────────────────
  readonly searchForm = this.fb.group({
    term: [''],
  });

  readonly passengerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    documentType: ['dni' as 'dni' | 'passport' | 'nie'],
    documentNumber: ['', Validators.required],
    nationality: [''],
    frequentFlyer: [false],
  });

  // ── BRIDGES FORM → SIGNAL ─────────────────────────────────────────────────────
  // toSignal convierte el Observable de statusChanges en una señal.
  // La suscripción se cancela automáticamente cuando el componente se destruye.

  private readonly formStatus = toSignal(this.passengerForm.statusChanges, {
    initialValue: this.passengerForm.status,
  });

  // No existe un observable para 'dirty', así que usamos un signal manual
  // que actualizamos en los sitios donde cambia (markAsDirty / markAsPristine).
  private readonly formDirty = signal(false);

  // ── PROPIEDADES DERIVADAS (computed) ──────────────────────────────────────────
  // computed() sólo se recalcula cuando alguna de sus señales dependientes cambia.
  canSave = computed(
    () =>
      this.formStatus() === 'VALID' &&
      this.formDirty() &&
      !this.facade.isSaving() &&
      (this.facade.selectedPassenger() !== null || this.facade.isCreating()),
  );

  selectedFullName = computed(() => {
    const p = this.facade.selectedPassenger();
    return p ? `${p.firstName} ${p.lastName}` : '';
  });

  get hasUnsavedChanges(): boolean {
    return (
      this.passengerForm.dirty &&
      (this.facade.selectedPassenger() !== null || this.facade.isCreating())
    );
  }

  // ── CICLO DE VIDA ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.facade.loadAll();

    // Suscripción al buscador: debounce de 300ms para no filtrar en cada tecla.
    // Necesita guardarse y cancelarse en ngOnDestroy.
    this.searchSub = this.searchForm.controls.term.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term) => {
        this.facade.applyFilter(term ?? '');
      });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  // ── MÉTODOS ───────────────────────────────────────────────────────────────────

  startNew(): void {
    this.facade.startNew();
    this.passengerForm.reset({
      documentType: 'dni',
      frequentFlyer: false,
    });
    this.passengerForm.markAsDirty();
    this.formDirty.set(true);
  }

  selectPassenger(passenger: PassengerProfile): void {
    this.facade.select(passenger);

    // Sincronizar el formulario con los datos del pasajero seleccionado.
    this.passengerForm.patchValue({
      firstName: passenger.firstName,
      lastName: passenger.lastName,
      email: passenger.email,
      phone: passenger.phone,
      documentType: passenger.documentType,
      documentNumber: passenger.documentNumber,
      nationality: passenger.nationality,
      frequentFlyer: passenger.frequentFlyer,
    });

    // Marcar como pristine para que canSave y hasUnsavedChanges sean false
    // justo después de seleccionar (todavía no hay cambios del usuario).
    this.passengerForm.markAsPristine();
    this.formDirty.set(false);
  }

  save(): void {
    if (!this.canSave()) return;

    this.facade.save(this.passengerForm.value as Partial<PassengerProfile>);

    // Una vez guardado, marcar el formulario como pristine.
    // Problema: esto se ejecuta antes de que la respuesta HTTP llegue,
    // porque save() es void y no devuelve Observable.
    // Si el guardado falla, el formulario ya está como pristine.
    this.passengerForm.markAsPristine();
    this.formDirty.set(true);
  }
}
