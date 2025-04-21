import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {UserRating} from '../components/booksPage/library-dashboard.component';

// Define the Book interface to match your GraphQL schema
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
  }[];
  favorites?: any[];
  bids?: any[];
  price?: number;
  totalPages?: number;
  damagedPages?: number;
  age?: number;
  edition?: number;
  language?: string;
  editor?: string;
  category?: string;
  rating?: UserRating[];
  createdAt?: string;
  likes?: number;
}

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private apiUrl = 'http://localhost:3000';
  constructor(private apollo: Apollo, private http: HttpClient) {}

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
            rating {
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
    .pipe(map((response) => response.data.viewBooks));
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
              owner {
                firstName
                lastName
              }
              bids {
                amount
              }
              rating {
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
            }
          }
        `,
        variables: { // Pass the variable like in viewBooks
          id: bookId, // Map the bookId parameter to the $id variable
        },
        fetchPolicy: 'network-only' // Example fetch policy
      })
      .pipe(
        // Map the response to extract the bookDetails data, like extracting viewBooks
        map((response) => response.data.bookDetails)
      ); // Added closing parenthesis and semicolon
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
            rating {
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
}
