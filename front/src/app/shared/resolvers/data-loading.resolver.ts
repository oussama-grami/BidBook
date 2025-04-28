import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { LoadingService } from '../../services/loading.service';

@Injectable({
  providedIn: 'root',
})
export class DataLoadingResolver {
  constructor(private loadingService: LoadingService) {}

  /**
   * Generic resolver that can be used for any route to ensure data is loaded
   * @param route Route snapshot
   * @param state Router state snapshot
   * @returns Observable that resolves when data is loaded
   */
  resolve(): Observable<boolean> {
    const loadingId = `resolve-${Math.random().toString(36).substring(2, 9)}`;

    // Start the loading process
    this.loadingService.startLoading(loadingId);

    // Here you could fetch actual data from a service
    // For example: return this.dataService.getData().pipe(
    //   finalize(() => this.loadingService.stopLoading(loadingId))
    // );

    // For demo, we'll just simulate a delay
    return of(true).pipe(
      delay(300), // Small delay to simulate data loading
      tap(() => {
        // Mark the loading as complete
        this.loadingService.stopLoading(loadingId);
      })
    );
  }
}
