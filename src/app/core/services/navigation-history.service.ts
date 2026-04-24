import { Injectable, inject, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NavigationHistoryService {
  private router = inject(Router);
  private location = inject(Location);
  private history: string[] = [];
  private isGoingBack = false;

  readonly canGoBack = signal(false);

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e) => {
      if (this.isGoingBack) {
        this.isGoingBack = false;
        return;
      }
      this.history.push((e as NavigationEnd).urlAfterRedirects);
      this.canGoBack.set(this.history.length > 1);
    });
  }

  goBack(fallback: string = '/'): void {
    if (this.history.length > 1) {
      this.history.pop();
      this.canGoBack.set(this.history.length > 1);
      this.isGoingBack = true;
      this.location.back();
    } else {
      this.router.navigateByUrl(fallback);
    }
  }
}
