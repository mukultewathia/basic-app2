import { enableProdMode }            from '@angular/core';
import { bootstrapApplication }      from '@angular/platform-browser';
import { AppComponent }              from './app/app';
import { appConfig }                 from './app/app.config';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

bootstrapApplication(AppComponent, {
  providers: [
    ...appConfig.providers,
    provideCharts(withDefaultRegisterables())
  ]
})
.catch(err => console.log(err));
