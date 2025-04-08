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
