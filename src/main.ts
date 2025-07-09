import { enableProdMode }            from '@angular/core';
import { bootstrapApplication }      from '@angular/platform-browser';
import { provideRouter }             from '@angular/router';
import { provideHttpClient }         from '@angular/common/http';   // ← import this
import { AppComponent }              from './app/app';
import { appRoutes }                 from './app/app.routes';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(),              // ← register HttpClient globally,
    provideCharts(withDefaultRegisterables())
  ]
})
.catch(err => console.log(err));
