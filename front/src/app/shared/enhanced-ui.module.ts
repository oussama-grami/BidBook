import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Enhanced Components
import { AnimatedCardComponent } from './components/animated-card/animated-card.component';
import { AnimatedButtonComponent } from './components/animated-button/animated-button.component';
import { ElegantLoadingComponent } from './components/elegant-loading/elegant-loading.component';

/**
 * Enhanced UI Module
 * 
 * This module provides elegant UI components with sophisticated animations
 * for creating a more polished user experience throughout the application.
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AnimatedCardComponent,
    AnimatedButtonComponent,
    ElegantLoadingComponent
  ],
  exports: [
    AnimatedCardComponent,
    AnimatedButtonComponent,
    ElegantLoadingComponent
  ]
})
export class EnhancedUIModule {}