import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentLoadedDirective } from '../../shared/content-loaded.directive';
import { RouteTransitionService } from '../../services/route-transition.service';
import { componentAnimations, contentLoadedAnimation } from '../../shared/route-animations';

@Component({
  selector: 'app-route-content-wrapper',
  standalone: true,
  imports: [CommonModule, ContentLoadedDirective],
  template: `
    <div 
      class="route-content" 
      appContentLoaded
      [delay]="200"
      (contentLoaded)="onContentLoaded()"
      [@componentAnimations]
      [@contentLoaded]="isLoaded ? 'loaded' : 'loading'"
    >
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .route-content {
      width: 100%;
      height: 100%;
      display: block;
    }
  `],
  animations: [componentAnimations, contentLoadedAnimation]
})
export class RouteContentWrapperComponent implements OnInit {
  @Input() pageTitle: string = '';
  isLoaded = false;

  constructor(private routeTransitionService: RouteTransitionService) {}

  ngOnInit() {
    // Reset loaded state when component initializes
    this.isLoaded = false;
  }

  onContentLoaded() {
    // Mark content as loaded after a small delay to ensure smooth animation
    setTimeout(() => {
      this.isLoaded = true;
    }, 100);
  }
}