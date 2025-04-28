import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { BookService } from '../../services/book.service';
import { UserIdService } from '../../services/userid.service';
import { switchMap, catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class OwnerGuard implements CanActivate {
  constructor(
    private bookService: BookService,
    private userIdService: UserIdService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    console.log('OwnerGuard: Route params:', route.params);
    const bookId = +route.params['id'];
    console.log('OwnerGuard: bookId:', bookId);
    const userId = this.userIdService.getUserId();
    console.log('OwnerGuard: userId:', userId);
    if (!userId) {
      console.log('OwnerGuard: User ID not found, redirecting to /login');
      return this.router.parseUrl('/login');
    }

    return this.bookService.getBook(bookId).pipe(
      map((book) => {
        console.log('OwnerGuard: Fetched book:', book);
        console.log('OwnerGuard: Current User ID:', userId);
        console.log('OwnerGuard: Book Owner ID:', book?.owner?.id);

        if (book && book.owner?.id === +userId) {
          console.log('OwnerGuard: User is the owner, allowing access');
          return true;
        } else {
          console.log('OwnerGuard: User is NOT the owner, redirecting to /books/' + bookId);
          return this.router.parseUrl(`/books/${bookId}`);
        }
      }),
      catchError((error) => {
        console.error('OwnerGuard: Error fetching book:', error);
        return of(this.router.parseUrl('/books'));
      })
    );
  }
}
