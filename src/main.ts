import { enableProdMode }            from '@angular/core';
import { bootstrapApplication }      from '@angular/platform-browser';
import { provideRouter }             from '@angular/router';
import { provideHttpClient }         from '@angular/common/http';   // ← import this
import { AppComponent }              from './app/app';
import { appRoutes }                 from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient()              // ← register HttpClient globally
  ]
})
.catch(err => console.log(err));
