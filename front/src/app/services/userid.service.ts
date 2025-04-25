import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserIdService {
  private userIdSubject = new BehaviorSubject<number | null>(null);
  userId$ = this.userIdSubject.asObservable();

  setUserId(userId: number | null): void {
    this.userIdSubject.next(userId);
  }

  getUserId(): number | null {
    return this.userIdSubject.value;
  }
}
