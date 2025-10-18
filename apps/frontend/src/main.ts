import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AppComponent } from './app/app.component';

/**
 * Point d'entrée de l'application frontend Angular.
 * Configure les providers et bootstrap le composant racine.
 */
bootstrapApplication(AppComponent, {
  providers: [
    // Configuration du client HTTP
    provideHttpClient(withInterceptorsFromDi()),
  ],
}).catch((err) => console.error(err));

