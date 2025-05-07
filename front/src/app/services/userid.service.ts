import { Injectable } from '@angular/core';
import { BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserIdService {
  private userIdSubject = new BehaviorSubject<number | null>(null);

  setUserId(userId: number | null): void {
    this.userIdSubject.next(userId);
  }

  getUserId(): number | null {
    return this.userIdSubject.value;
  }
}
