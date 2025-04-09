import { Injectable, NgZone, ApplicationRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private loadingProgressSubject = new BehaviorSubject<number>(0);
  public loadingProgress$ = this.loadingProgressSubject.asObservable();

  constructor(private ngZone: NgZone, private applicationRef: ApplicationRef) {
    // Wait for initial application stability
    this.applicationRef.isStable
      .pipe(first((isStable) => isStable))
      .subscribe(() => {
        console.log('Loading service: Application is stable');
        this.hide();
        this.updateProgress(0);
      });
  }

  show() {
    this.ngZone.runOutsideAngular(() => {
      this.loadingSubject.next(true);
    });
  }

  hide() {
    this.ngZone.runOutsideAngular(() => {
      this.loadingSubject.next(false);
    });
  }

  updateProgress(progress: number) {
    this.ngZone.runOutsideAngular(() => {
      this.loadingProgressSubject.next(Math.min(100, Math.max(0, progress)));
    });
  }
}
