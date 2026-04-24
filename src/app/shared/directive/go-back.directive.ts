import { Directive, HostListener, Input, inject } from '@angular/core';
import { NavigationHistoryService } from '../../core/services/navigation-history.service';

@Directive({
  selector: '[appGoBack]',
  standalone: true
})
export class GoBackDirective {
  private navigationHistory = inject(NavigationHistoryService);

  @Input('appGoBack') fallbackRoute: string = '/';

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.navigationHistory.goBack(this.fallbackRoute);
  }
}
