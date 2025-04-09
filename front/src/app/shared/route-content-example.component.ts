import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentLoadedDirective } from './content-loaded.directive';
import { RouteContentWrapperComponent } from '../components/route-content-wrapper/route-content-wrapper.component';
import { ComponentReadyService } from '../services/component-ready.service';
import { componentAnimations, listAnimation } from './route-animations';

/**
 * Example component showing how to implement the loading and animation system
 * This can be used as a template for other route components
 */
@Component({
  selector: 'app-route-content-example',
  standalone: true,
  imports: [CommonModule, ContentLoadedDirective, RouteContentWrapperComponent],
  template: `
    <app-route-content-wrapper>
      <div class="content-container" appContentLoaded (contentLoaded)="onContentLoaded()">
        <!-- Main content goes here -->
        <h1 [@componentAnimations]>Page Title</h1>
        
        <!-- Example of animated list items -->
        <div class="items-container">
          <div 
            *ngFor="let item of items; let i = index" 
            class="item" 
            [@listAnimation]
            [style.animation-delay]="i * 100 + 'ms'"
          >
            Item {{ item }}
          </div>
        </div>
      </div>
    </app-route-content-wrapper>
  `,
  styles: [`
    .content-container {
      padding: 1rem;
    }
    
    .items-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .item {
      padding: 1rem;
      background-color: var(--surface-card);
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  `],
  animations: [componentAnimations, listAnimation]
})
export class RouteContentExampleComponent implements OnInit {
  items: number[] = [];
  
  constructor(private componentReadyService: ComponentReadyService) {}
  
  ngOnInit() {
    // Reset component ready state
    this.componentReadyService.reset();
    
    // Update progress as component loads
    this.componentReadyService.updateProgress(30);
    
    // Simulate loading data
    setTimeout(() => {
      this.componentReadyService.updateProgress(60);
      
      // Load items with a delay to simulate API call
      this.loadItems();
    }, 500);
  }
  
  loadItems() {
    // Simulate API call
    setTimeout(() => {
      this.items = Array.from({length: 5}, (_, i) => i + 1);
      
      // Update progress to 90% after data is loaded
      this.componentReadyService.updateProgress(90);
    }, 500);
  }
  
  onContentLoaded() {
    // Mark component as ready with a small delay for smooth transition
    setTimeout(() => {
      this.componentReadyService.setReady(200);
    }, 300);
  }
}