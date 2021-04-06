import { Component, OnInit } from '@angular/core';
import { ElectronService } from "ngx-electron";
import { ChatService } from '@app/services/chat/chat.service'
import { FormBuilder } from '@angular/forms';
import { SocketService } from '@app/services/socket/socket.service';

@Component({
  selector: 'app-chat-bar',
  templateUrl: './chat-bar.component.html',
  styleUrls: ['./chat-bar.component.scss']
})

export class ChatBarComponent implements OnInit {
  isWindowButtonAvailable: boolean = true;

  constructor(public chatService: ChatService, private electronService: ElectronService, private formBuilder: FormBuilder, private socketService: SocketService) {}
  createChatForm = this.formBuilder.group({
    chatName: '',
  });

  changeChat(name: string): void {
    this.chatService.setCurrentChat(name);
  }

  ngOnInit(): void {
    if(!this.electronService.process){
      this.isWindowButtonAvailable = false;
    }
  }

  openExternalWindow(): void {
    this.chatService.isChatInExternalWindow = true;
    let BrowserWindow = this.electronService.remote.BrowserWindow
    let chatWindow = new BrowserWindow({
      width: 384,
      height: 840,
      resizable: false,
    })
    chatWindow.loadURL('file://' + __dirname + '/index.html#/chat');

    let chatBar = document.getElementById('chat-bar');
    if(chatBar){
      chatBar.style.display = 'none';
    }

    chatWindow.on('close', () => {
      this.chatService.isChatInExternalWindow = false;
      let chatBar = document.getElementById('chat-bar');
      if(chatBar){
        chatBar.style.display = 'block';
      }
    })
  }

  createChat(): void {
    if(this.createChatForm.value.chatName == "" || !this.createChatForm.value.chatName) return;
    this.chatService.createChat(this.createChatForm.value.chatName);
    this.createChatForm.reset();

  }
  
  joinChat(chatId: string): void {
    this.socketService.bind('joinChatRoomCallback', () => {
      this.chatService.refreshChatList();
      this.socketService.unbind('joinChatRoomCallback')
    });
    this.chatService.joinChat(chatId);
  }

  leaveChat(chatId: string): void {
    this.socketService.bind('leaveChatRoomCallback', () => {
      this.chatService.refreshChatList();
      this.socketService.unbind('leaveChatRoomCallback');
      this.chatService.setCurrentChat('General');
    });
    this.chatService.leaveChat(chatId);
  }

  refreshChatList(): void {
    this.chatService.refreshChatList();
  }
}
