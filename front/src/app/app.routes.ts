import {Routes} from '@angular/router';
import {EbooksComponent} from './ebooks/ebooks.component';
import {BookDetailComponent} from './book-detail/book-detail.component';
import {ReadBookComponent} from './read-book/read-book.component';
import {LoginPageComponent} from './login-page/login-page.component';
import {SignupPageComponent} from './signup-page/signup-page.component';
import {AddBookComponent} from './add-book/add-book.component';
import {EbookCardComponent} from './components/ebook-card/ebook-card.component';
import {BookDetailsComponent} from './components/book-details/book-details.component';

export const routes: Routes = [
  {path: '', component: EbooksComponent},
  {path: 'books/:id', component: BookDetailComponent},
  {path: 'read/:id', component: ReadBookComponent},
  {path: 'login', component: LoginPageComponent},
  {path: 'signup', component: SignupPageComponent},
  {path: 'add-book', component: AddBookComponent},
  {path: "e-book", component: BookDetailsComponent},
];
