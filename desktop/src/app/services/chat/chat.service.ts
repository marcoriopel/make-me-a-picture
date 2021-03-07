import { Injectable } from '@angular/core';
import { Chat, Message } from '@app/classes/chat';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SocketService } from '@app/services/socket/socket.service';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private baseUrl = environment.api_url;
  private getJoinedChatUrl = this.baseUrl + '/api/chat/joined';
  public isChatInExternalWindow: boolean = false;
  private chatList: Chat[] = [{
    name: 'Général',
    messages: [],
    chatId: 'General',
  }];
  private index: number = 0;
  private currentChatId: string = "General";

  constructor(private http: HttpClient, private socketService: SocketService) {
    this.initializeChats();
    this.initializeMessageListener();
  }

  async initializeChats() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem('token')!});
    const options = { headers: headers};
    this.http.get<any>(this.getJoinedChatUrl, options)
      .subscribe((data: any) => {
        this.chatList.pop(); // Temporary fix to async construction problem
        data.chats.forEach((element: any) => {
          const chat: Chat = {
            name: element.chatName,
            chatId: element.chatId,
            messages: [],
          }
          this.chatList.push(chat);
        });
      });
  }

  setCurrentChat(chatId: string): void {
    this.currentChatId = chatId;
    for(let i = 0; i < this.chatList.length; i++){
      if(this.chatList[i].chatId == chatId){
        this.index = i;
      }
    }
  }

  getChatMessages(): Message[] {
    return this.chatList[this.index]["messages"];
  }

  getChatList(): Chat[] {
    return this.chatList;
  }

  getCurrentChat(): string {
    return this.currentChatId;
  }

  sendMessage(message: string): void {
    const jwt = localStorage.getItem('token');
    this.socketService.emit('message', { "text": message, "token": jwt, "chatId": this.currentChatId })
  }

  initializeMessageListener(): void {
    this.socketService.bind('message', (message: any) => {
      const username = localStorage.getItem('username');
      const msg: Message = {
        "username": message.user.username,
        "avatar": message.user.avatar,
        "text": message.text,
        "timeStamp": message.timeStamp,
        "isUsersMessage": message.user.username === username ? true : false,
        "textColor": message.textColor
      }
      this.chatList[this.index]["messages"].push(msg);
    });
  }
}
