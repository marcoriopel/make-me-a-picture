import { Injectable } from '@angular/core';
import { ACCESS } from '@app/classes/acces';
import { io, Socket } from "socket.io-client";
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket: Socket;
  private baseUrl = environment.api_url;

  constructor() {
    this.connect(this.baseUrl);
  }

  connect(url: string): void {
    if (!this.socket) {
      const jwt = localStorage.getItem(ACCESS.TOKEN) as string;
      this.socket = io(url, {
        extraHeaders: {
          "authorization": jwt
        }
      });
    }
    this.socket.connect();
  }

  disconnect(): void {
    this.socket.disconnect()
  }

  emit(event: string, param: object): void {
    this.socket.emit(event, param);
  }

  bind(event: string, func: Function): void {
    this.socket.on(event, func);
  }

  unbind(event: string): void {
    this.socket.off(event);
  }

}

