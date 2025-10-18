import { Component } from '@angular/core';
import { SearchPageComponent } from './features/search/search.page';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SearchPageComponent],
  template: `<app-search></app-search>`,
})
export class AppComponent {}
