import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment.prod';

if (environment.production) {
  enableProdMode();
  // if (window) {
  //   window.console.log = () => { };
  // }
  localStorage.setItem('connected', 'disconnected');
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
