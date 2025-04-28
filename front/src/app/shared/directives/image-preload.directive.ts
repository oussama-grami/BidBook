import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  OnInit,
} from '@angular/core';
import { LoadingService } from '../../services/loading.service';

@Directive({
  selector: 'img[appImagePreload]',
  standalone: true,
})
export class ImagePreloadDirective implements OnInit {
  @Input() fallback: string = '/images/image.png'; // Default fallback image
  @Output() loaded = new EventEmitter<boolean>();

  private loadingId: string;

  constructor(
    private el: ElementRef<HTMLImageElement>,
    private loadingService: LoadingService
  ) {
    // Generate unique ID for this image load operation
    this.loadingId = `img-${Math.random().toString(36).substring(2, 15)}`;
  }

  ngOnInit(): void {
    // Start tracking this image load
    this.loadingService.startLoading(this.loadingId);

    // Set default error handling
    this.el.nativeElement.onerror = () => {
      this.handleError();
    };
  }

  @HostListener('load')
  onLoad(): void {
    // Stop tracking this image load when it's complete
    this.loadingService.stopLoading(this.loadingId);
    this.loaded.emit(true);
  }

  @HostListener('error')
  handleError(): void {
    // If image fails, use fallback
    this.el.nativeElement.src = this.fallback;

    // Still need to stop loading tracking
    this.loadingService.stopLoading(this.loadingId);
    this.loaded.emit(false);
  }
}
