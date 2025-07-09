import type { Routes }         from '@angular/router';
import { HomeComponent }       from './home/home';
import { LoginComponent }      from './login/login';
import {Signup} from './signup/signup';
import { WeightComponent } from './weight/weight';

export const appRoutes: Routes = [
  { path: '',      redirectTo: '/login', pathMatch: 'full' },
  { path: 'home',  component: HomeComponent },
  { path: 'signup',  component: Signup },
  { path: 'login', component: LoginComponent },
  { path: 'weight', component: WeightComponent },
  { path: '**',    redirectTo: '/login' }
];
