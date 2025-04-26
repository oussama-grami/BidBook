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
    const bookId = +route.params['id'];
    const userId = this.userIdService.getUserId();

    if (!userId) {

      return this.router.parseUrl('/login');
    }

    return this.bookService.getBook(bookId).pipe(
      map((book) => {
        if (book && book.owner?.id === +userId) {
          return true;
        } else {

          return this.router.parseUrl(`/books/${bookId}`);
        }
      }),
      catchError(() => {

        return of(this.router.parseUrl('/books'));
      })
    );
  }
}
