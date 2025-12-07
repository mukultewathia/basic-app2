import { Routes } from '@angular/router';
import { Route } from '@angular/router';
import { ChallengesPageComponent } from './challenges.page';
import { ChallengeDetailPageComponent } from './challenge-detail.page';

export const challengeBase: Route = {
  path: 'metrics-app/challenges', 
  component: ChallengesPageComponent,
  title: 'Challenges'
} 

export const challengesRoutes: Routes = [
  { 
    path: 'metrics-app/challenges', 
    component: ChallengesPageComponent,
    title: 'Challenges'
  },
  { 
    path: 'metrics-app/challenges/:id', 
    component: ChallengeDetailPageComponent,
    title: 'Challenge Details'
  }
];
