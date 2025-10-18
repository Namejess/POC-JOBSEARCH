import { Component } from '@angular/core';
import { SearchPageComponent } from './features/search/search.page';

/**
 * Composant racine de l'application.
 * Pour le MVP, affiche directement la page de recherche.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SearchPageComponent],
  template: `<app-search-page></app-search-page>`,
})
export class AppComponent {}

