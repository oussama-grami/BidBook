import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private messageService: MessageService) {}

  showSuccess(message: string, title: string = 'Success') {
    this.messageService.add({
      severity: 'success',
      summary: title,
      detail: message,
    });
  }

  showError(message: string, title: string = 'Error') {
    this.messageService.add({
      severity: 'error',
      summary: title,
      detail: message,
    });
  }

  showInfo(message: string, title: string = 'Info') {
    this.messageService.add({
      severity: 'info',
      summary: title,
      detail: message,
    });
  }

  showWarning(message: string, title: string = 'Warning') {
    this.messageService.add({
      severity: 'warn',
      summary: title,
      detail: message,
    });
  }

  clear() {
    this.messageService.clear();
  }
}
