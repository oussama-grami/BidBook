import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../src/environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    console.log('SocketService: Connecting to', environment.socketUrl);
    this.socket = io(environment.socketUrl, {
      autoConnect: true,
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('SocketService: Successfully connected. Socket ID:', this.socket.id);
    });

    this.socket.on('connect_error', (error) => {
      console.error('SocketService: Connection error:', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('SocketService: Disconnected. Reason:', reason);
    });

    this.socket.on('error', (error) => {
      console.error('SocketService: Socket error:', error);
    });
  }

  emit(event: string, data: any) {
    this.socket.emit(event, data);
  }

  listen<T>(event: string) {
    return new Observable<T>((subscriber) => {
      this.socket.on(event, (data: T) => subscriber.next(data));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
