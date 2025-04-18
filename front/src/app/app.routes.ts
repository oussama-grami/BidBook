import { Routes } from '@angular/router';
import { DataLoadingResolver } from './shared/resolvers/data-loading.resolver';
import { tokenValidationGuard } from './shared/guards/token-validation.guard';

export const routes: Routes = [
  {
    path: 'books',
    canActivate: [tokenValidationGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/booksPage/library-dashboard.component').then(
            (c) => c.BookCatalogComponent
          ),
        resolve: { pageData: DataLoadingResolver },
        data: { animation: 'fade', isFavorite: false },
      },
      {
        path: 'favorite',
        loadComponent: () =>
          import('./components/booksPage/library-dashboard.component').then(
            (c) => c.BookCatalogComponent
          ),
        resolve: { pageData: DataLoadingResolver },
        data: { animation: 'slideLeft', isFavorite: true },
      },
      {
        path: 'add',
        loadComponent: () =>
          import('./components/add-book/add-book.component').then(
            (c) => c.AddBookComponent
          ),
        resolve: { pageData: DataLoadingResolver },
        data: { animation: 'slideLeft' },
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/book-details/book-details.component').then(
            (c) => c.BookDetailsComponent
          ),
        resolve: { pageData: DataLoadingResolver },
        data: { animation: 'zoom' },
      },
    ],
  },
  {
    path: 'articles',
    canActivate: [tokenValidationGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/articlesPage/dashboard.component').then(
            (c) => c.DashboardComponent
          ),
        resolve: { pageData: DataLoadingResolver },
        data: { animation: 'slideLeft' },
      },
      {
        path: 'add',
        loadComponent: () =>
          import('./components/add-blog/add-blog.component').then(
            (c) => c.AddBlogComponent
          ),
        resolve: { pageData: DataLoadingResolver },
        data: { animation: 'slideLeft' },
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/blog/blog.component').then(
            (c) => c.BlogComponent
          ),
        resolve: { pageData: DataLoadingResolver },
        data: { animation: 'zoom' },
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login-page/login-page.component').then(
        (c) => c.LoginPageComponent
      ),
    resolve: { pageData: DataLoadingResolver },
    data: { animation: 'fade' },
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./components/signup-page/signup-page.component').then(
        (c) => c.SignupPageComponent
      ),
    resolve: { pageData: DataLoadingResolver },
    data: { animation: 'slideLeft' },
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import(
        './components/email-verification/email-verification.component'
      ).then((c) => c.EmailVerificationComponent),
    resolve: { pageData: DataLoadingResolver },
    data: { animation: 'fade' },
  },
  {
    path: 'forget-password',
    loadComponent: () =>
      import('./components/forget-password/forget-password.component').then(
        (c) => c.ForgetPasswordComponent
      ),
    resolve: { pageData: DataLoadingResolver },
    data: { animation: 'fade' },
  },
  {
    path: 'mfa-setup',
    canActivate: [tokenValidationGuard],
    loadComponent: () =>
      import('./components/mfa-setup/mfa-setup.component').then(
        (c) => c.MfaSetupComponent
      ),
    resolve: { pageData: DataLoadingResolver },
    data: { animation: 'fade' },
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./components/auth-callback/auth-callback.component').then(
        (c) => c.AuthCallbackComponent
      ),
    resolve: { pageData: DataLoadingResolver },
    data: { animation: 'fade' },
  },
  {
    path: 'auth/callback/:provider',
    loadComponent: () =>
      import('./components/auth-callback/auth-callback.component').then(
        (c) => c.AuthCallbackComponent
      ),
    resolve: { pageData: DataLoadingResolver },
    data: { animation: 'fade' },
  },
  {
    path: 'notifications',
    canActivate: [tokenValidationGuard],
    loadComponent: () =>
      import('./components/NotificationPage/notifications-page.component').then(
        (c) => c.NotificationsPageComponent
      ),
    resolve: { pageData: DataLoadingResolver },
    data: { animation: 'slideLeft' },
  },
  {
    path: 'payment',
    canActivate: [tokenValidationGuard],
    loadComponent: () =>
      import('./components/payment/payment.component').then(
        (c) => c.PaymentComponent
      ),
    resolve: { pageData: DataLoadingResolver },
    data: { animation: 'zoom' },
  },
  {
    path: 'chat',
    canActivate: [tokenValidationGuard],
    loadComponent: () =>
      import('./components/chat/chat.component').then((c) => c.ChatComponent),
    resolve: { pageData: DataLoadingResolver },
    data: { animation: 'slideLeft' },
  },
  {
    path: 'transactions',
    canActivate: [tokenValidationGuard],
    loadComponent: () =>
      import(
        './components/transactions-history/transactions-history.component'
      ).then((c) => c.TransactionsHistoryComponent),
    resolve: { pageData: DataLoadingResolver },
    data: { animation: 'fade' },
  },
  // Added error page routes
  {
    path: 'error',
    loadComponent: () =>
      import('./components/error-page/error-page.component').then(
        (c) => c.ErrorPageComponent
      ),
    resolve: { pageData: DataLoadingResolver },
    data: { animation: 'fade' },
  },
  {
    path: 'error/:code',
    loadComponent: () =>
      import('./components/error-page/error-page.component').then(
        (c) => c.ErrorPageComponent
      ),
    resolve: { pageData: DataLoadingResolver },
    data: { animation: 'slideLeft' },
  },
  { path: '', redirectTo: 'books', pathMatch: 'full' },
  // Wildcard route for 404 - this should be the last route
  {
    path: '**',
    loadComponent: () =>
      import('./components/error-page/error-page.component').then(
        (c) => c.ErrorPageComponent
      ),
    resolve: { pageData: DataLoadingResolver },
    data: { animation: 'fade', errorCode: 404 },
  },
];
