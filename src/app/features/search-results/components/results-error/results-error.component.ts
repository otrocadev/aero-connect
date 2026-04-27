import { Component, Input, input, Signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { GoBackDirective } from '../../../../shared/directive/go-back.directive';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-results-error',
  imports: [MatIcon, GoBackDirective, MatButton],
  templateUrl: './results-error.component.html',
  styleUrl: './results-error.component.scss'
})
export class ResultsErrorComponent {
  @Input() error!: Signal<string | null>;
}
