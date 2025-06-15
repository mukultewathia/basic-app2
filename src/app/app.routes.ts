import type { Routes }         from '@angular/router';
import { HomeComponent }       from './home/home';
import { LoginComponent }      from './login/login';
import {Signup} from './signup/signup';

export const appRoutes: Routes = [
  { path: '',      redirectTo: '/home', pathMatch: 'full' },
  { path: 'home',  component: HomeComponent },
  { path: 'signup',  component: Signup },
  { path: 'login', component: LoginComponent },
  { path: '**',    redirectTo: '/home' }
];
