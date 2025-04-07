import {Routes} from '@angular/router';
import {LoginPageComponent} from './login-page/login-page.component';
import {SignupPageComponent} from './signup-page/signup-page.component';
import {AddBookComponent} from './add-book/add-book.component';
import {BookCatalogComponent} from './components/booksPage/library-dashboard.component';
import {BookDetailsComponent} from './components/book-details/book-details.component';
import {DashboardComponent} from './components/articlesPage/dashboard.component';
import {
  NotificationsPageComponent
} from './components/NotificationPage/notifications-page.component';
import {MessagesComponent} from './components/messages/messages.component';

export const routes: Routes = [
  {path: '', component: BookCatalogComponent},
  {path: 'articles', component: DashboardComponent},
  {path: 'book-details', component: BookDetailsComponent},
  {path: 'login', component: LoginPageComponent},
  {path: 'signup', component: SignupPageComponent},
  {path: 'add-book', component: AddBookComponent},
  {path: "notifications", component: NotificationsPageComponent},
  {path: 'messages',component:MessagesComponent},
  {path: '**', redirectTo: ''},
];
