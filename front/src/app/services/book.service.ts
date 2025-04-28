

import {Injectable} from '@angular/core';
import {Apollo, gql, MutationResult, QueryRef} from 'apollo-angular';
import {Observable, tap} from 'rxjs';
import {map} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {UserRating} from '../components/booksPage/library-dashboard.component';
import {BidStatus} from '../enums/status.enum';
import { DELETE_BOOK_RATING_MUTATION,ADD_COMMENT_TO_BOOK_MUTATION, ADD_FAVORITE_MUTATION, ADD_RATE_MUTATION, REMOVE_FAVORITE_MUTATION, UPDATE_BOOK_RATE_MUTATION } from '../mutations/book.mutation';
import { GET_BOOK_COMMENTS_PAGINATED, GET_COMMENT_COUNT, GET_FAVORITE_COUNT } from '../queries/book.query';
export interface Bid {
  id: number;
  amount: number;
  bidStatus: BidStatus;
  createdAt: string;
  book: {
    id: number;
    title: string;
    picture: string;
  };
  bidder: {
    id: number;
  };
}

export interface Book {
  id: number;
  title: string;
  author?: string;
  picture: string;
  owner?: {
    id: number;
    firstName: string;
    lastName: string;
    imageUrl: string;
  };
  comments?: {
    id: number;
    content: string;
    user?: {
      firstName: string;
      lastName: string;
    };
    createdAt: string;
  }[];
  favorites?: any[];
  bids?: Bid[];
  price?: number;
  totalPages?: number;
  damagedPages?: number;
  age?: number;
  edition?: number;
  language?: string;
  editor?: string;
  category?: string;
  ratings?: UserRating[];
  createdAt?: string;
  likes?: number;
  isBiddingOpen?: boolean;
}
export interface AddCommentToBookResponse {
  addCommentToBook: {
    id: number;
    content: string;
    user?: {
      firstName: string;
      lastName: string;
      imageUrl: string;
    };
    createdAt: string;
  };
}
interface User {
  id: number;
  firstName: string;
  lastName: string;
  imageUrl: string;
}

interface Comment {
  id: number;
  content: string;
  user: User;
  createdAt: string;
}

interface GetBookCommentsResponseData {
  GetBookCommentsPaginated: Comment[];
}
interface CommentCountQueryResponse {
  CommentCount: number;
}
interface CommentCountQueryVariables {
  bookId: number;
}

interface FavoriteCountQueryResponse {
  FavoriteCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private apiUrl = 'http://localhost:3000';
  constructor(private apollo: Apollo, private http: HttpClient) {
    console.log('BookService initialized');
  }

  predictBookPrice(bookData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/books/predict`, bookData);
  }

  addBook(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/books/add`, formData);
  }

  updateBook(id: number, formData: FormData): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/update/${id}`, formData);
  }

  viewBooks(limit?: number, offset?: number): Observable<Book[]> {
    return this.apollo
    .query<{ viewBooks: Book[] }>({
      query: gql`
        query ViewBooks($limit: Int, $offset: Int) {
          viewBooks(limit: $limit, offset: $offset) {
            id
            title
            picture
            ratings {
              rate
            }
            favorites {
              id
            }
            bids {
              id
            }
            
            category
            createdAt
          }
        }
      `,
      variables: {
        limit: limit,
        offset: offset,
      },
    })
    .pipe(map((response) => response.data.viewBooks),
      tap((res) => {
        console.log("viewBooks response", res);
      })
    );
  }

  getBookDetails(bookId: number): Observable<Book> {
    return this.apollo
    .query<{ bookDetails: Book }>({
      query: gql`
        query BookDetailsQuery($id: Int!) {
          bookDetails(id: $id) {
            id
            title
            author
            picture
            price
            totalPages
            damagedPages
            age
            edition
            language
            editor
            category
            createdAt
            bids {
              amount
            }
            ratings {
              rate
              user {
                id
              }
            }
            comments {
              id
              content
              createdAt
              user {
                id
                firstName
                lastName
                imageUrl
              }
            }
            favorites {
              id
              user {
                id
              }
            }
            isBiddingOpen
          }
        }
      `,
      variables: {
        id: bookId,
      },
      fetchPolicy: 'network-only'
    })
    .pipe(

      map((response) => response.data.bookDetails)
    );
  }

  getBook(id: number): Observable<Book> {
    return this.apollo
    .query<{ book: Book }>({
      query: gql`
        query GetBook($id: Int!) {
          book(id: $id) {
            id
            title
            author
            picture
            owner {
              id
              firstName
              lastName
              imageUrl
            }
            comments {
              id
              content
              user {
                firstName
                lastName
              }
            }
            category
            language
            price
            totalPages
            damagedPages
            age
            edition
            editor
            ratings {
              rate
              user {
                id
              }
              createdAt
              updatedAt
            }
            favorites {
              id
              user {
                id
              }
            }
            bids {
              id
              amount
              bidder {
                id
                firstName
                lastName
                imageUrl
              }
              createdAt
              bidStatus
            }
          }
        }
      `,
      variables: {
        id: id,
      },
    })
    .pipe(map((response) => response.data.book));
  }

  createBid(bookId: number, amount: number): Observable<Bid | undefined> {
    return this.apollo.mutate<{ createBid: Bid }>({
      mutation: gql`
        mutation CreateBid($bookId: Int!, $amount: Float!) {
          createBid(bookId: $bookId, amount: $amount) {
            id
            amount
            bidder {
              id
            }
            book {
              id
            }
            createdAt
            bidStatus
          }
        }
      `,
      variables: {
        bookId: bookId,
        amount: amount,
      }
    }).pipe(map(response => response.data?.createBid));
  }
  updateBid( bookId: number, amount: number): Observable<Bid | undefined> {
    return this.apollo.mutate<{ updateBid: Bid }>({
      mutation: gql`
        mutation UpdateBid($bookId: Int!, $amount: Float!) {
          updateBid( bookId: $bookId, amount: $amount) {
            id
            amount
            bidder {
              id
            }
            book {
              id
            }
            createdAt
            bidStatus
          }
        }
      `,
      variables: {
        bookId: bookId,
        amount: amount,
      }

    }).pipe(map(response => response.data?.updateBid));
  }

  myBids(limit?: number, offset?: number): Observable<Bid[]> {
    return this.apollo
    .query<{ myBids: Bid[] }>({
      query: gql`
        query myBids($limit: Int, $offset: Int) {
          myBids(limit: $limit, offset: $offset) {
            id
            amount
            createdAt
            bidder {
              id
              firstName
              lastName
            }
            bidStatus
            book{
              id
              title
              picture
            }
          }
        }

      `,
      variables: {
        limit: limit,
        offset: offset,
      },
      fetchPolicy: 'network-only'
    })
    .pipe(
      map((response) => response.data.myBids),
      tap((res) => {
        console.log("myBids response", res);
      })
    )
      ;
  }
  getMyBooks(limit?: number, offset?: number): Observable<Book[]> {
    return this.apollo
    .query<{ myBooks: Book[] }>({
      query: gql`
        query MyBooks($limit: Int, $offset: Int) {
          myBooks(limit: $limit, offset: $offset) {
            id
            title
            picture
            ratings {
              rate
            }
            favorites {
              id
            }
            bids {
              id
            }
            comments {
                id
            }
            category
            createdAt
          }
        }
      `,
      variables: {
        limit: limit,
        offset: offset,
      },
    })
    .pipe(
      map((response) => response.data.myBooks),
      tap((res) => {
        console.log("myBooks response", res);
      })
    );
  }

  addCommentToBook(bookId: number, content: string): Observable<MutationResult<AddCommentToBookResponse>> {
    return this.apollo.mutate<AddCommentToBookResponse>({
      mutation: ADD_COMMENT_TO_BOOK_MUTATION,
      variables: {
        bookId,
        content,
      },
    });
  }
  addBookToFavorites(bookId: number) {
    return this.apollo.mutate({
      mutation: ADD_FAVORITE_MUTATION,
      variables: {
        bookId: bookId,
      },

    });
  }

  removeFavorite(bookId: number): Observable<boolean> {
    return this.apollo.mutate<{ removeFavorite: boolean }>({
      mutation: REMOVE_FAVORITE_MUTATION,
      variables: {
        bookId,
      },
    }).pipe(
      map(result => result.data!.removeFavorite)
    );
  }

  addBookRating(bookId: number, rate: number): Observable<UserRating> {
    if (rate < 0 || rate > 5) {
      throw new Error('La note doit être entre 0 et 5.');
    }

    return this.apollo.mutate<{ addRate: UserRating }>({
      mutation: ADD_RATE_MUTATION,
      variables: {
        bookId: bookId,
        rate: rate,
      },
    }).pipe(
      map(result => {
        if (result.data && result.data.addRate) {
          return result.data.addRate;
        } else {
          throw new Error('Mutation returned unexpected data structure');
        }
      })
    );
  }
  updateBookRate(bookId: number, rate: number): Observable<UserRating> {
    return this.apollo.mutate<UserRating>({
      mutation: UPDATE_BOOK_RATE_MUTATION,
      variables: {
        bookId,
        rate,
      },
    }).pipe(
      map(result => {
        if (result.data ) {
          return result.data;
        }
        console.error('Mutation did not return expected data', result);
        throw new Error('Failed to get UserRating from mutation result');
      })
    );
}
  deleteBookRating(bookId: number): Observable<boolean> {
    return this.apollo.mutate<{ deleteRate: boolean }>({
      mutation: DELETE_BOOK_RATING_MUTATION,
      variables: {
        bookId,
      },
    }).pipe(
      map(result => result.data?.deleteRate || false)
    );
  }

getBookCommentsPaginated(
  bookId: number,
  limit?: number,
  offset?: number
): Observable<Comment[]> {
  return this.apollo
    .watchQuery<GetBookCommentsResponseData>({
      query: GET_BOOK_COMMENTS_PAGINATED,
      variables: {
        bookId: bookId,
        limit: limit,
        offset: offset,
      },
    })
    .valueChanges.pipe(
      map(result => result.data.GetBookCommentsPaginated)
    );
}

getCommentCountForBook(bookId: number): Observable<number> {
  return this.apollo
    .watchQuery<CommentCountQueryResponse, CommentCountQueryVariables>({
      query: GET_COMMENT_COUNT,
      variables: { bookId },
    })
    .valueChanges.pipe(
      map(result => {
        if (result.errors) {
          console.error('GraphQL Errors:', result.errors);
          throw new Error('Error fetching comment count from GraphQL');
        }
        return result.data.CommentCount;
      })
    );
}
getFavoriteCount(bookId: number): Observable<number> {
  return this.apollo
    .query<FavoriteCountQueryResponse>({
      query: GET_FAVORITE_COUNT,
      variables: {
        bookId: bookId,
      },
    })
    .pipe(
      map(result => {
        if (result.data && result.data.FavoriteCount !== undefined) {
          return result.data.FavoriteCount;
        } else {
          throw new Error('Données de FavoriteCount invalides.');
        }
      })
      
    );
}

}
