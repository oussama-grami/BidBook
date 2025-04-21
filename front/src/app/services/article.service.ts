import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  private apiUrl = 'http://localhost:3000/articles';

  constructor(private http: HttpClient) {}

  createArticle(articleData: any): Observable<any> {
    console.log(articleData);
    return this.http.post(this.apiUrl, articleData);
  }

    uploadImage(formData: FormData) {
      return this.http.post<{ imageUrl: string }>('http://localhost:3000/upload', formData);

    }
    getAllArticles(): Observable<any> {
      return this.http.get(this.apiUrl);
    }
    getArticleById(id: number): Observable<any> {
      return this.http.get(this.apiUrl + '/' + id);
    }
}
