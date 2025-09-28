import type { Routes }         from '@angular/router';
import { HomeComponent }       from './home/home';
import { LoginComponent }      from './login/login';
import {Signup} from './signup/signup';
import { WeightComponent } from './weight/weight';
import { MafiaComponent } from './mafia/mafia';
import { habitsRoutes } from './habits/habits.routes';
import { challengesRoutes } from './challenges/challenges.routes';

export const appRoutes: Routes = [
  { path: '',      redirectTo: '/mafia', pathMatch: 'full' },
  { path: 'mafia', component: MafiaComponent },
  { path: 'metrics-app/home',  component: HomeComponent },
  { path: 'metrics-app/signup-me',  component: Signup },
  { path: 'metrics-app/login', component: LoginComponent },
  { path: 'metrics-app/weight', component: WeightComponent },
  ...habitsRoutes,
  ...challengesRoutes,
  { path: '**',    redirectTo: '/mafia' }
];
