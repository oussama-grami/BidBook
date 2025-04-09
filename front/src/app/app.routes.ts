import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/booksPage/library-dashboard.component').then(
        (c) => c.BookCatalogComponent
      ),
  },
  {
    path: 'articles',
    loadComponent: () =>
      import('./components/articlesPage/dashboard.component').then(
        (c) => c.DashboardComponent
      ),
  },
  {
    path: 'book-details',
    loadComponent: () =>
      import('./components/book-details/book-details.component').then(
        (c) => c.BookDetailsComponent
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login-page/login-page.component').then(
        (c) => c.LoginPageComponent
      ),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./signup-page/signup-page.component').then(
        (c) => c.SignupPageComponent
      ),
  },
  {
    path: 'add-book',
    loadComponent: () =>
      import('./add-book/add-book.component').then((c) => c.AddBookComponent),
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import('./components/NotificationPage/notifications-page.component').then(
        (c) => c.NotificationsPageComponent
      ),
  },
  {
    path: 'forget-password',
    loadComponent: () =>
      import('./components/forget-password/forget-password.component').then(
        (c) => c.ForgetPasswordComponent
      ),
  },
  {
    path: 'payment',
    loadComponent: () =>
      import('./components/payment/payment.component').then(
        (c) => c.PaymentComponent
      ),
  },
  { path: '**', redirectTo: '' },
];
