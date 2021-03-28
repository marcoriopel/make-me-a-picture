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
  private createChatUrl = this.baseUrl + '/api/chat/create';
  private getChatListUrl = this.baseUrl + '/api/chat/list';
  public isChatInExternalWindow: boolean = false;
  joinedChatList: Chat[] = [{
    name: 'Général',
    messages: [],
    chatId: 'General',
  }];
  notJoinedChatList: Chat[] = [{
    name: 'Général',
    messages: [],
    chatId: 'General',
  }];
  index: number = 0;
  currentChatId: string = "General";

  constructor(private http: HttpClient, private socketService: SocketService) {
    this.initializeChats();
    this.initializeMessageListener();
  }

  async initializeChats() {
    this.joinedChatList = [];
    this.notJoinedChatList = [];
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem('token')!});
    const options = { headers: headers};
    this.http.get<any>(this.getJoinedChatUrl, options)
      .subscribe((data: any) => {
        data.chats.forEach((element: any) => {
          const chat: Chat = {
            name: element.chatName,
            chatId: element.chatId,
            messages: [],
          }
          this.joinedChatList.push(chat);
          if(element.chatId != 'General'){
            this.joinChat(element.chatId);
          }
        });
        this.http.get<any>(this.getChatListUrl, options)
        .subscribe((data: any) => {
          data.chats.forEach((element: any) => {
            const chat: Chat = {
              name: element.chatName,
              chatId: element.chatId,
              messages: [],
            }
            let isChatAlreadyJoined = false;
            this.joinedChatList.forEach((el: Chat) => {
              if(el.chatId == chat.chatId){
                isChatAlreadyJoined = true;
              }
            })
            if(!isChatAlreadyJoined) this.notJoinedChatList.push(chat);
          });
        });
      });
  }

  setCurrentChat(chatId: string): void {
    this.currentChatId = chatId;
    for(let i = 0; i < this.joinedChatList.length; i++){
      if(this.joinedChatList[i].chatId == chatId){
        this.index = i;
      }
    }
  }

  getChatMessages(): Message[] {
    try {
      return this.joinedChatList[this.index].messages;
    } catch {
      return [] // Not initialized yet
    }
  }

  refreshChatList(): void {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem('token')!});
    const options = { headers: headers};
    this.http.get<any>(this.getJoinedChatUrl, options)
      .subscribe((data: any) => {
        data.chats.forEach((element: any) => {
          let isChatAlreadyLoaded = false;
          this.joinedChatList.forEach((chat: any) => {
            if(chat.chatId == element.chatId) isChatAlreadyLoaded = true;
          })
          if(!isChatAlreadyLoaded){
            const chat: Chat = {
              name: element.chatName,
              chatId: element.chatId,
              messages: [],
            }
            this.joinedChatList.push(chat);            
          }
        });
        this.http.get<any>(this.getChatListUrl, options)
        .subscribe((data: any) => {
          data.chats.forEach((element: any) => {
            const chat: Chat = {
              name: element.chatName,
              chatId: element.chatId,
              messages: [],
            }
            let isChatAlreadyJoined = false;
            this.joinedChatList.forEach((el: Chat) => {
              if(el.chatId == chat.chatId){
                isChatAlreadyJoined = true;
              }
            })
            let isChatAlreadyLoaded = false;
            this.notJoinedChatList.forEach((chat: any) => {
              if(chat.chatId == element.chatId) isChatAlreadyLoaded = true;
            })
            if(!isChatAlreadyJoined && !isChatAlreadyLoaded) this.notJoinedChatList.push(chat);
          });
        });
      });
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
      for(let i = 0; i < this.joinedChatList.length; i++) {
        if(this.joinedChatList[i].chatId == message.chatId){
          this.joinedChatList[i].messages.push(msg);
        }
      }
      if(message.chatId != this.currentChatId){
        alert('notif!')
      }
    });
  }

  createChat(chatName: string){
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem('token')!});
    const options = { headers: headers};
    this.http.post<any>(this.createChatUrl, {"chatName": chatName}, options)
    .subscribe((data: any) => {
      console.log(data);
    });
  }

  joinChat(chatId: string): void {
    for(let i = 0; i < this.notJoinedChatList.length; i++){
      if(this.notJoinedChatList[i].chatId == chatId){
        this.notJoinedChatList.splice(i, 1);
      }
    }
    this.socketService.emit('joinChatRoom', { "chatId": chatId })
  }

  leaveChat(chatId: string): void {
    for(let i = 0; i < this.joinedChatList.length; i++){
      if(this.joinedChatList[i].chatId == chatId){
        this.joinedChatList.splice(i, 1);
      }
    }
    this.socketService.emit('leaveChatRoom', { "chatId": chatId })
  }
}
