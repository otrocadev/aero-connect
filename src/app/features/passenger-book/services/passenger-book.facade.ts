import { Injectable, computed, inject, signal } from '@angular/core';
import { Injectable, computed, inject, signal } from '@angular/core';
import { PassengerService } from '../../../core/services/passenger.service';
import { PassengerProfile } from '../../../core/models/passenger.model';
import { take } from 'rxjs';

/**
 *? Facade de PassengerBook — versión imperativa
 *?
 *? Responsabilidades:
 *?  - Coordinar las llamadas HTTP (PassengerService)
 *?  - Mantener el estado de la feature
 *?  - Exponer una API limpia al componente
 *?
 *? Problemas de esta implementación que resolveremos con Signals:
 *?  1. Estado mutable y público → cualquiera puede escribir en él
 *?  2. 'filteredPassengers' es un array duplicado de 'passengers' → pueden desincronizarse
 *?  3. La lógica de filtrado tiene que ejecutarse manualmente en dos sitios (loadAll + applyFilter)
 *?  4. setTimeout para ocultar el banner de éxito → no es reactivo
 *?  5. Ninguna propiedad derivada está memoizada
 */
@Injectable()
export class PassengerBookFacade {
  private readonly passengerService = inject(PassengerService);

  // ── ESTADO ───────────────────────────────────────────────────────────────────
  // Propiedades de clase planas: no hay notificación automática de cambios,
  // Angular los detecta sólo porque usa Zone.js y revisión de árbol completo.

  public passengers = signal<PassengerProfile[]>([]);
  public searchTerm = signal('');

  // computed: se recalcula automáticamente cuando 'passengers' o 'searchTerm' cambian.
  // Ya no hay array duplicado ni sincronización manual.
  public filteredPassengers = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.passengers();
    return this.passengers().filter(
      (p) =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(term) ||
        p.documentNumber.toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term),
    );
  });

  public selectedPassenger = signal<PassengerProfile | null>(null);

  // true mientras el formulario está en modo "alta" (en lugar de edición)
  public isCreating = signal(false);
  public isLoading = signal(false);
  public isSaving = signal(false);
  public error = signal<string | null>(null);
  public saveSuccess = signal(false);

  // ── ACCIONES ─────────────────────────────────────────────────────────────────

  loadAll(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.passengerService
      .getAll()
      .pipe(take(1))
      .subscribe({
        next: (passengers) => {
          this.passengers.set(passengers);
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar los pasajeros.');
          this.isLoading.set(false);
        },
      });
  }

  select(passenger: PassengerProfile): void {
    this.selectedPassenger.set(passenger);
    this.isCreating.set(false);
    this.error.set(null);
    this.saveSuccess.set(false);
    this.selectedPassenger.set(passenger);
    this.isCreating.set(false);
    this.error.set(null);
    this.saveSuccess.set(false);
  }

  startNew(): void {
    this.selectedPassenger.set(null);
    this.isCreating.set(true);
    this.error.set(null);
    this.saveSuccess.set(false);
    this.selectedPassenger.set(null);
    this.isCreating.set(true);
    this.error.set(null);
    this.saveSuccess.set(false);
  }

  applyFilter(term: string): void {
    this.searchTerm.set(term);
  }

  save(data: Partial<PassengerProfile>): void {
    this.isSaving.set(true);
    this.error.set(null);
    this.saveSuccess.set(false);
    this.isSaving.set(true);
    this.error.set(null);
    this.saveSuccess.set(false);

    if (this.isCreating()) {
      this._create(data);
    } else {
      this._update(this.selectedPassenger()!.id, data);
    }
  }

  private _update(id: string, data: Partial<PassengerProfile>): void {
    this.passengerService
      .update(id, data)
      .pipe(take(1))
      .subscribe({
        next: (updated) => {
          // Actualizar en 'passengers' (fuente de verdad).
          // filteredPassengers se recalcula automáticamente vía computed.
          this.passengers.update((list) =>
            list.map((p) => (p.id === id ? updated : p)),
          );

          this.selectedPassenger.set(updated);
          this.isSaving.set(false);
          this.saveSuccess.set(true);

          // Ocultar el banner de éxito tras 3 segundos.
          // setTimeout con Zone.js funciona, pero en OnPush hay que envolverlo en NgZone.run().
          // Con signals, esto se resuelve de otra forma.
          setTimeout(() => {
            this.saveSuccess.set(false);
          }, 3000);
        },
        error: () => {
          this.error.set('No se pudo guardar. Inténtalo de nuevo.');
          this.isSaving.set(false);
        },
      });
  }

  private _create(data: Partial<PassengerProfile>): void {
    this.passengerService
      .create(data as Omit<PassengerProfile, 'id' | 'totalFlights'>)
      .pipe(take(1))
      .subscribe({
        next: (created) => {
          // Añadir el nuevo pasajero a 'passengers'.
          // filteredPassengers se recalcula automáticamente vía computed.
          this.passengers.update((list) => [...list, created]);

          this.selectedPassenger.set(created);
          this.isCreating.set(false);
          this.isSaving.set(false);
          this.saveSuccess.set(true);

          setTimeout(() => {
            this.saveSuccess.set(false);
          }, 3000);
        },
        error: () => {
          this.error.set('No se pudo crear el pasajero. Inténtalo de nuevo.');
          this.isSaving.set(false);
        },
      });
  }
}
