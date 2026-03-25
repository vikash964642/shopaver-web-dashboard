import { Routes } from '@angular/router';
import { Login } from './login/login';
export const routes: Routes = [
   {
    path: '',
    loadComponent: () =>
      import('./login/login')
        .then(m => m.Login),
  },

  // Optional: direct /login access
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login')
        .then(m => m.Login),
  },
  {
    path: 'landing-page-list',
    loadComponent: () =>
      import('./list-component/list-component')
        .then(m => m.ListComponent),
  },
  {
    path: 'landing-page-data',
    loadComponent: () =>
      import('./form-data/form-data')
        .then(m => m.FormData),
  },
  {
    path: 'create-landing-page',
    loadComponent: () =>
      import('./create-landing-page/create-landing-page') 
        .then(m => m.CreateLandingPage),
  },
  {
    path: 'create-landing-page/:slug',
    loadComponent: () =>
      import('./create-landing-page/create-landing-page')
        .then(m => m.CreateLandingPage),
  },
];