import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationHistoryService } from './core/services/navigation-history.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent {
  navigationHistory = inject(NavigationHistoryService);
}
