import { Component, Input, Signal } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-results-spinner',
  imports: [ MatProgressSpinner ],
  templateUrl: './results-spinner.component.html',
  styleUrl: './results-spinner.component.scss'
})
export class ResultsSpinnerComponent {
  @Input() isLoading!: Signal<boolean>;
}
