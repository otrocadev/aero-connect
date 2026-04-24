import { Injectable, signal, Renderer2, inject, RendererFactory2, provideEnvironmentInitializer } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';

const Z_INDEX_FULLSCREEN = 2147483647;

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private rendererFactory = inject(RendererFactory2);
  private renderer: Renderer2;
  private activeIds = new Set<string>();
  private overlayElements = new Map<string, HTMLElement>();
  private navigationLoadingId: string | null = null;

  public isLoading = signal<boolean>(false);

  constructor() {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.injectKeyframes();
  }

  private injectKeyframes(): void {
    if (document.getElementById('loading-service-keyframes')) return;
    const style = this.renderer.createElement('style');
    this.renderer.setAttribute(style, 'id', 'loading-service-keyframes');
    style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
    this.renderer.appendChild(document.head, style);
  }

  connectToRouter(router: Router): void {
    router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.navigationLoadingId = this.show();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        if (this.navigationLoadingId) {
          const id = this.navigationLoadingId;
          this.navigationLoadingId = null;
          setTimeout(() => this.hide(id), 1500);
        }
      }
    });
  }

  show(): string {
    const id = this.generateId();
    this.activeIds.add(id);
    this.isLoading.set(true);
    this.createOverlay(id);
    return id;
  }

  hide(id: string): void {
    if (!this.activeIds.has(id)) return;

    this.activeIds.delete(id);

    const overlay = this.overlayElements.get(id);
    if (overlay?.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
    this.overlayElements.delete(id);

    if (this.activeIds.size === 0) {
      this.isLoading.set(false);
    }
  }

  hideAll(): void {
    [...this.activeIds].forEach(id => this.hide(id));
  }

  private createOverlay(id: string): void {
    const overlay = this.renderer.createElement('div');

    this.renderer.setStyle(overlay, 'position', 'fixed');
    this.renderer.setStyle(overlay, 'top', '0');
    this.renderer.setStyle(overlay, 'left', '0');
    this.renderer.setStyle(overlay, 'width', '100%');
    this.renderer.setStyle(overlay, 'height', '100%');
    this.renderer.setStyle(overlay, 'background-color', 'rgba(255, 255, 255, 0.8)');
    this.renderer.setStyle(overlay, 'backdrop-filter', 'blur(4px)');
    this.renderer.setStyle(overlay, 'display', 'flex');
    this.renderer.setStyle(overlay, 'align-items', 'center');
    this.renderer.setStyle(overlay, 'justify-content', 'center');
    this.renderer.setStyle(overlay, 'z-index', String(Z_INDEX_FULLSCREEN));
    this.renderer.addClass(overlay, 'loading-overlay');

    this.renderer.appendChild(overlay, this.createSpinner());
    this.renderer.appendChild(document.body, overlay);
    this.overlayElements.set(id, overlay);
  }

  private createSpinner(): HTMLElement {
    const spinner = this.renderer.createElement('div');
    this.renderer.setStyle(spinner, 'width', '48px');
    this.renderer.setStyle(spinner, 'height', '48px');
    this.renderer.setStyle(spinner, 'border', '4px solid rgba(103, 58, 183, 0.2)');
    this.renderer.setStyle(spinner, 'border-top', '4px solid #FFCC00');
    this.renderer.setStyle(spinner, 'border-radius', '50%');
    this.renderer.setStyle(spinner, 'animation', 'spin 0.8s linear infinite');
    this.renderer.addClass(spinner, 'loading-spinner');
    return spinner;
  }

  private generateId(): string {
    return `loading-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
}

export function provideLoadingOnNavigation() {
  return provideEnvironmentInitializer(() => {
    inject(LoadingService).connectToRouter(inject(Router));
  });
}
