import { Routes } from '@angular/router';
import { RouteLoadingGuard } from './shared/route-loading.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/booksPage/library-dashboard.component').then(
        (c) => c.BookCatalogComponent
      ),
    canActivate: [RouteLoadingGuard],
    data: { animation: 'fade' },
  },
  {
    path: 'articles',
    loadComponent: () =>
      import('./components/articlesPage/dashboard.component').then(
        (c) => c.DashboardComponent
      ),
    canActivate: [RouteLoadingGuard],
    data: { animation: 'slideLeft' },
  },
  {
    path: 'book-details',
    loadComponent: () =>
      import('./components/book-details/book-details.component').then(
        (c) => c.BookDetailsComponent
      ),
    canActivate: [RouteLoadingGuard],
    data: { animation: 'zoom' },
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login-page/login-page.component').then(
        (c) => c.LoginPageComponent
      ),
    canActivate: [RouteLoadingGuard],
    data: { animation: 'fade' },
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./signup-page/signup-page.component').then(
        (c) => c.SignupPageComponent
      ),
    canActivate: [RouteLoadingGuard],
    data: { animation: 'slideLeft' },
  },
  {
    path: 'add-book',
    loadComponent: () =>
      import('./add-book/add-book.component').then((c) => c.AddBookComponent),
    canActivate: [RouteLoadingGuard],
    data: { animation: 'slideLeft' },
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import('./components/NotificationPage/notifications-page.component').then(
        (c) => c.NotificationsPageComponent
      ),
    canActivate: [RouteLoadingGuard],
    data: { animation: 'slideLeft' },
  },
  {
    path: 'forget-password',
    loadComponent: () =>
      import('./components/forget-password/forget-password.component').then(
        (c) => c.ForgetPasswordComponent
      ),
    canActivate: [RouteLoadingGuard],
    data: { animation: 'fade' },
  },
  {
    path: 'payment',
    loadComponent: () =>
      import('./components/payment/payment.component').then(
        (c) => c.PaymentComponent
      ),
    canActivate: [RouteLoadingGuard],
    data: { animation: 'zoom' },
  },
  { path: '**', redirectTo: '', canActivate: [RouteLoadingGuard] }
];
