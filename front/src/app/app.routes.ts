import { Routes } from '@angular/router';
import { RouteLoadingGuard } from './shared/route-loading.guard';

export const routes: Routes = [
  {
    path: 'books',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/booksPage/library-dashboard.component').then(
            (c) => c.BookCatalogComponent
          ),
        canActivate: [RouteLoadingGuard],
        data: { animation: 'fade', isFavorite: false },
      },
      {
        path: 'favorite',
        loadComponent: () =>
          import('./components/booksPage/library-dashboard.component').then(
            (c) => c.BookCatalogComponent
          ),
        canActivate: [RouteLoadingGuard],
        data: { animation: 'slideLeft', isFavorite: true },
      },
      {
        path: 'add',
        loadComponent: () =>
          import('./add-book/add-book.component').then(
            (c) => c.AddBookComponent
          ),
        canActivate: [RouteLoadingGuard],
        data: { animation: 'slideLeft' },
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/book-details/book-details.component').then(
            (c) => c.BookDetailsComponent
          ),
        canActivate: [RouteLoadingGuard],
        data: { animation: 'zoom' },
      },
    ],
  },
  {
    path: 'articles',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/articlesPage/dashboard.component').then(
            (c) => c.DashboardComponent
          ),
        canActivate: [RouteLoadingGuard],
        data: { animation: 'slideLeft' },
      },
      {
        path: 'add',
        loadComponent: () =>
          import('./components/add-blog/add-blog.component').then(
            (c) => c.AddBlogComponent
          ),
        canActivate: [RouteLoadingGuard],
        data: { animation: 'slideLeft' },
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/blog/blog.component').then(
            (c) => c.BlogComponent
          ),
        canActivate: [RouteLoadingGuard],
        data: { animation: 'zoom' },
      },
    ],
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
    path: 'forget-password',
    loadComponent: () =>
      import('./components/forget-password/forget-password.component').then(
        (c) => c.ForgetPasswordComponent
      ),
    canActivate: [RouteLoadingGuard],
    data: { animation: 'fade' },
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
    path: 'payment',
    loadComponent: () =>
      import('./components/payment/payment.component').then(
        (c) => c.PaymentComponent
      ),
    canActivate: [RouteLoadingGuard],
    data: { animation: 'zoom' },
  },
  {
    path: 'chat',
    loadComponent: () =>
      import('./components/chat/chat.component').then((c) => c.ChatComponent),
    canActivate: [RouteLoadingGuard],
    data: { animation: 'slideLeft' },
  },
  {
    path: 'transactions',
    loadComponent: () =>
      import(
        './components/transactions-history/transactions-history.component'
      ).then((c) => c.TransactionsHistoryComponent),
    canActivate: [RouteLoadingGuard],
    data: { animation: 'fade' },
  },
  // Added error page routes
  {
    path: 'error',
    loadComponent: () =>
      import('./error-page/error-page.component').then(
        (c) => c.ErrorPageComponent
      ),
    data: { animation: 'fade' },
  },
  {
    path: 'error/:code',
    loadComponent: () =>
      import('./error-page/error-page.component').then(
        (c) => c.ErrorPageComponent
      ),
    data: { animation: 'slideLeft' },
  },
  { path: '', redirectTo: 'books', pathMatch: 'full' },
  // Wildcard route for 404 - this should be the last route
  {
    path: '**',
    loadComponent: () =>
      import('./error-page/error-page.component').then(
        (c) => c.ErrorPageComponent
      ),
    data: { animation: 'fade', errorCode: 404 },
  },
];
