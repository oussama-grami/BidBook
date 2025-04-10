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
          import('./components/articlesPage/dashboard.component').then(
            (c) => c.DashboardComponent
          ),
        canActivate: [RouteLoadingGuard],
        data: { animation: 'slideLeft' },
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/articlesPage/dashboard.component').then(
            (c) => c.DashboardComponent
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
  { path: '', redirectTo: 'books', pathMatch: 'full' },
  { path: '**', redirectTo: 'books' },
import {Routes} from '@angular/router';
import {LoginPageComponent} from './login-page/login-page.component';
import {SignupPageComponent} from './signup-page/signup-page.component';
import {AddBookComponent} from './add-book/add-book.component';
import {BookCatalogComponent} from './components/booksPage/library-dashboard.component';
import {BookDetailsComponent} from './components/book-details/book-details.component';
import {DashboardComponent} from './components/articlesPage/dashboard.component';
import {NotificationsPageComponent} from './components/NotificationPage/notifications-page.component';
import {ChatComponent} from './components/chat/chat.component';
import {BlogComponent} from './components/blog/blog.component';
import {AddBlogComponent} from './components/add-blog/add-blog.component';
import {TransactionsHistoryComponent} from './components/transactions-history/transactions-history.component';

export const routes: Routes = [
  {path: '', component: BookCatalogComponent},
  {path: 'articles', component: DashboardComponent},
  {path: 'book-details', component: BookDetailsComponent},
  {path: 'login', component: LoginPageComponent},
  {path: 'signup', component: SignupPageComponent},
  {path: 'add-book', component: AddBookComponent},
  {path: "notifications", component: NotificationsPageComponent},
  {path:'chat',component:ChatComponent},
  {path:'blog',component:BlogComponent},
  {path:'addBlog',component:AddBlogComponent},
  {path:'transactions',component:TransactionsHistoryComponent},
  {path: '**', redirectTo: ''}
];
