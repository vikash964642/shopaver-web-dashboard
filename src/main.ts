// import 'zone.js'; 
// import { bootstrapApplication } from '@angular/platform-browser';
// import { provideHttpClient, withInterceptors } from '@angular/common/http';
// import { provideRouter } from '@angular/router';
// import { App } from './app/app';
// import { routes } from './app/app.routes';
// import { authInterceptor } from './app/auth.interceptor';

// bootstrapApplication(App, {
//   providers: [
//     provideRouter(routes),
//     // provideHttpClient(withInterceptors([authInterceptor]))
//   ]
// });
//   // .catch((err) => console.error(err));


import 'zone.js'; 
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { App } from './app/app';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/auth.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
     provideAnimations(),   // ✅ required
    provideToastr() ,

    // ✅ FIX HERE
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    )
  ]
});