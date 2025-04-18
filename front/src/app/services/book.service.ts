
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = 'http://localhost:3000'; 

  constructor(private http: HttpClient) {}

  predictBookPrice(bookData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/books/predict`, bookData);
  }

  addBook(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/books/add`, formData);
  }
}