import { Injectable } from '@angular/core';
import { Chat, JoinedChat, Message } from '@app/classes/chat';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { SocketService } from '@app/services/socket/socket.service';
import { environment } from 'src/environments/environment';
import { formatDateString } from '@app/classes/date';
@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private baseUrl = environment.api_url;
  private getJoinedChatUrl = this.baseUrl + '/api/chat/joined';
  private createChatUrl = this.baseUrl + '/api/chat/create';
  private getChatListUrl = this.baseUrl + '/api/chat/list';
  private getChatHistoryUrl = this.baseUrl + '/api/chat/history';
  private deleteChatUrl = this.baseUrl + '/api/chat/delete';
  public isChatInExternalWindow: boolean = false;
  public isClosingExternalWindow: boolean = false;
  joinedChatList: JoinedChat[] = [{
    name: 'Général',
    messages: [],
    chatId: 'General',
    isNotificationOn: false,
    isChatHistoryDisplayed: false,
    isGameChat: false,
  }];
  notJoinedChatList: Chat[] = [{
    name: 'Général',
    messages: [],
    chatId: 'General',
    isGameChat: false,
  }];
  index: number = 0;
  currentChatId: string = "General";

  constructor(private http: HttpClient, private socketService: SocketService) {
    let joinedChats = localStorage.getItem('joinedChats');
    let notJoinedChats = localStorage.getItem('notJoinedChats');
    if(joinedChats && notJoinedChats){
      this.joinedChatList = JSON.parse(joinedChats);
      this.notJoinedChatList = JSON.parse(notJoinedChats);
      let externalChatId = localStorage.getItem('currentChatId');
      if(externalChatId) this.setCurrentChat(externalChatId);
    } else {
      this.initializeChats();
    }
    this.initializeMessageListener();

    setTimeout(() => {
      let mainWindowSocketId = localStorage.getItem('socketId');
      if(localStorage.getItem('isExternalWindow')){
        localStorage.removeItem('isExternalWindow');
        
        if(mainWindowSocketId != null) {
          this.socketService.bind('refreshChatRequest', async (data: any) => {
            await this.refreshChatList();
            this.setCurrentChat(data.chatId);
          })
          this.socketService.emit('openExternalChat', {linkedSocketId: mainWindowSocketId, isExternalWindow: true});
        }
      } else {
      }      
    }, 500);

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
          const chat: JoinedChat = {
            name: element.chatName,
            chatId: element.chatId,
            messages: [],
            isNotificationOn: false,
            isChatHistoryDisplayed: false,
            isGameChat: element.isGameChat,
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
              isGameChat: element.isGameChat,
            }
            let isChatAlreadyJoined = false;
            this.joinedChatList.forEach((el: any) => {
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
    let isChatJoined = false;
    this.joinedChatList.forEach((chat: any) => {
      if(chat.chatId == chatId) isChatJoined = true;
    });
    if(!isChatJoined) return;
    this.currentChatId = chatId;
    for(let i = 0; i < this.joinedChatList.length; i++){
      if(this.joinedChatList[i].chatId == chatId){
        this.index = i;
      }
    }
    this.joinedChatList[this.index].isNotificationOn = false;
  }

  getChatMessages(): Message[] {
    try {
      return this.joinedChatList[this.index].messages;
    } catch {
      return [] // Not initialized yet
    }
  }

  async refreshChatList() {
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
            const chat: JoinedChat = {
              name: element.chatName,
              chatId: element.chatId,
              messages: [],
              isNotificationOn: false,
              isChatHistoryDisplayed: false,
              isGameChat: element.isGameChat,
            }
            this.joinedChatList.push(chat);            
          }
        });
        for(let i = 0; i < this.joinedChatList.length; i++){
          const id = this.joinedChatList[i].chatId;
          let isChatDeleted = true;
          data.chats.forEach((chat: any) => {
            if(chat.chatId == id) isChatDeleted = false;
          });
          if(isChatDeleted){
            this.joinedChatList.splice(i, 1);
          }
        }
        this.http.get<any>(this.getChatListUrl, options)
        .subscribe((data: any) => {

          data.chats.forEach((element: any) => {
            const chat: Chat = {
              name: element.chatName,
              chatId: element.chatId,
              messages: [],
              isGameChat: element.isGameChat,
            }
            let isChatAlreadyJoined = false;
            this.joinedChatList.forEach((el: any) => {
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
          this.setCurrentChat(this.currentChatId);
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
      if(message.chatId != this.currentChatId){
        for(let i = 0; i < this.joinedChatList.length; i++){
          if(message.chatId == this.joinedChatList[i].chatId){
            this.joinedChatList[i].isNotificationOn = true;
          }
        }        
      }

      const msg: Message = {
        "username": message.user.username,
        "avatar": message.user.avatar,
        "text": message.text,
        "timestamp": formatDateString(message.timestamp),
        "isUsersMessage": message.user.username === username ? true : false,
        "textColor": message.textColor
      }
      for(let i = 0; i < this.joinedChatList.length; i++) {
        if(this.joinedChatList[i].chatId == message.chatId){
          this.joinedChatList[i].messages.push(msg);
        }
      }

      if(message.chatId == this.currentChatId){
        setTimeout(() => {
          this.onNewMessage();          
        }, 1);
      }
    });
  }

  loadChatHistory(): void {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem('token')!});
    let params = new HttpParams();
    params = params.append('chatId', this.currentChatId);    
    const options = { params: params, headers: headers};
    this.http.get<any>(this.getChatHistoryUrl, options).subscribe((data: any) => {
      const username = localStorage.getItem('username');
      this.joinedChatList[this.index].messages = [];
      data.chatHistory.forEach((message: any) => {
        const msg: Message = {
          "username": message.username,
          "avatar": message.avatar,
          "text": message.message,
          "timestamp": formatDateString(message.timestamp),
          "isUsersMessage": message.username === username ? true : false,
          "textColor": "#000000",
        }
        this.joinedChatList[this.index].messages.push(msg);  
      });
      this.joinedChatList[this.index].isChatHistoryDisplayed = true;
    });
  }

  createChat(chatName: string){
    for(let i = 0; i < this.notJoinedChatList.length; i++){
      if(this.notJoinedChatList[i].name == chatName){
        if(!this.notJoinedChatList[i].isGameChat){
          this.socketService.bind('joinChatRoomCallback', () => {
            this.refreshChatList();
            this.socketService.unbind('joinChatRoomCallback')
          });
          this.joinChat(this.notJoinedChatList[i].chatId);
          return;          
        }
      }
    }
    for(let i = 0; i< this.joinedChatList.length; i++){
      if(this.joinedChatList[i].name == chatName){
        this.setCurrentChat(this.joinedChatList[i].chatId);
        return;
      }
    }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem('token')!});
    const options = { headers: headers};
    this.http.post<any>(this.createChatUrl, {"chatName": chatName}, options)
    .subscribe((data: any) => {
      this.refreshChatList();
    });
  }

  deleteChat(): void {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem('token')!});
    let params = new HttpParams();
    params = params.append('chatId', this.currentChatId);    
    const options = { params: params, headers: headers, responseType: 'text' as 'json'};
    this.http.delete<any>(this.deleteChatUrl, options).subscribe(async (data: any) => {
      await this.refreshChatList();
      this.setCurrentChat('General');
    });
  }

  joinChat(chatId: string): void {
    for(let i = 0; i < this.notJoinedChatList.length; i++){
      if(this.notJoinedChatList[i].chatId == chatId){
        this.notJoinedChatList.splice(i, 1);
      }
    }
    this.currentChatId = chatId;
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

  onNewMessage(): void {
    let messageScroller = document.getElementById('message-scroller');
    if(messageScroller) {
      messageScroller.scrollTop = messageScroller.scrollHeight;
    }
  }
}
