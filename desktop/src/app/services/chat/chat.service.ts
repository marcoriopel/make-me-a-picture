import { Injectable } from '@angular/core';
import { io } from "socket.io-client";

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private chatListComplet: any[] = [];
  private index: number = 0;
  private chatList: string[] = [];
  private currentChat: string = "General";

  constructor() { 
    // TODO: Get all user's chat
    this.connect();
  }

  connect(): void {
    // Prevent double connection
    if (this.chatListComplet.length == 0) {
      this.connectToNewChat("General", "http://18.217.235.167:3000/" );
      this.connectToNewChat("Local", "http://localhost:3000/");
      this.setCurrentChat(this.chatList[0]);
    }
  }

  deconnect(): void {
    this.chatListComplet.forEach(chat => {
      chat["socket"].off("message");
      delete chat["socket"];
    });
    this.chatListComplet = [];
    this.chatList = [];
    this.currentChat = '';
  }

  setCurrentChat(name: string): void {
    for(let i=0; i<this.chatListComplet.length; i++) {
      if (this.chatListComplet[i]["name"] == name) {
        this.index = i;
        this.currentChat = name;
        break;
      }
    }
  }

  getChatMessages(): void {
    return this.chatListComplet[this.index]["messages"];
  }

  getChatList(): string[] {
    return this.chatList;
  }

  getCurrentChat(): string {
    return this.currentChat;
  }

  sendMessage(message:string): void {
    const jwt = localStorage.getItem('token');
    this.chatListComplet[this.index]["socket"].emit('message', {"text": message,"token": jwt});
  }

  private connectToNewChat(name: string, url: string): void {
    // TODO (Feature 85-90): try catch for non existant server
    const socket = io(url);
    socket.connect();
    console.log(socket.connected);
    const index = this.chatListComplet.push({name: name, url: url, socket: io(url), messages: []});
    this.index = index - 1;
    // TODO (Waiting for server side): Get history
    this.bindMessage(index - 1, name);
  }

  private bindMessage(index: number, name: string): void {
    this.chatListComplet[index]["socket"].on('connect', () => {
      this.chatList.push(name);
      this.setCurrentChat(name);
    });

    this.chatListComplet[index]["socket"].on('message', (message: any) => {
      // TODO (Feature 85-90): Catch error if socket not connected
      const username = localStorage.getItem('username');
      this.chatListComplet[index]["messages"].push({"username": message.username, "text": message.text, "timeStamp": message.timeStamp, "isUsersMessage": message.username === username ? true: false, "textColor": message.textColor});
    });
  }

}
