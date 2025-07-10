import type { Routes }         from '@angular/router';
import { HomeComponent }       from './home/home';
import { LoginComponent }      from './login/login';
import {Signup} from './signup/signup';
import { WeightComponent } from './weight/weight';
import { MafiaComponent } from './mafia/mafia';

export const appRoutes: Routes = [
  { path: '',      redirectTo: '/mafia', pathMatch: 'full' },
  { path: 'mafia', component: MafiaComponent },
  { path: 'metrics-app/home',  component: HomeComponent },
  { path: 'metrics-app/signup',  component: Signup },
  { path: 'metrics-app/login', component: LoginComponent },
  { path: 'metrics-app/weight', component: WeightComponent },
  { path: '**',    redirectTo: '/mafia' }
];
