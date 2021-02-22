import { Injectable } from '@angular/core';
import { io, Socket } from "socket.io-client";



@Injectable({
  providedIn: 'root'
})
export class ChatService {

  chatList: any[] = [];
  socket: Socket
  isChatInExternalWindow: boolean = false;

  chatMessageList: any[] = [];

  constructor() { 
    this.chatList.push({name: "General", url: "http://18.217.235.167:3000/"});
    this.chatList.push({name: "Local", url: "http://localhost:3000/"});

  }

  connectToChat(url: string): void {
    this.chatMessageList = [];
    console.log(url)
    this.socket = io(url);
    // TODO: Get history
    this.bindMessage()
  }

  bindMessage(): void {
    this.socket.on('message', (message: any) => {
      const username = localStorage.getItem('username');
      this.chatMessageList.push({"username": message.username, "text": message.text, "timeStamp": message.timeStamp, "isUsersMessage": message.username === username ? true: false, "textColor": message.textColor});
      console.log(this.chatMessageList);
    });
  }

  unbindMessage(): void {
    this.socket.off('message');
  }

  sendMessage(message:string): void {
    console.log('sending message')
    const jwt = localStorage.getItem('token');
    this.socket.emit('message', {"text": message,"token": jwt});
    console.log('message send')
    // this.socket.emit('message', {"text": message,"token": jwt});

  }

}
