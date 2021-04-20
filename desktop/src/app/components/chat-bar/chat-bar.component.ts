import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ElectronService } from "ngx-electron";
import { ChatService } from '@app/services/chat/chat.service'
import { FormBuilder, Validators } from '@angular/forms';
import { SocketService } from '@app/services/socket/socket.service';
import { GameService } from '@app/services/game/game.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-chat-bar',
  templateUrl: './chat-bar.component.html',
  styleUrls: ['./chat-bar.component.scss']
})

export class ChatBarComponent implements OnInit, OnDestroy {
  isWindowButtonAvailable: boolean = true;

  constructor(private snackBar: MatSnackBar, private ngZone: NgZone, private router: Router, public chatService: ChatService, private electronService: ElectronService, private formBuilder: FormBuilder, private socketService: SocketService, public gameService: GameService) {}
  createChatForm = this.formBuilder.group({
    chatName: ['', Validators.maxLength(12)],
  });

  changeChat(id: string): void {
    this.chatService.setCurrentChat(id);
  }

  ngOnInit(): void {
    if(!this.electronService.process){
      this.isWindowButtonAvailable = false;
    }
  }

  ngOnDestroy(): void {
    if(this.chatService.isChatInExternalWindow){
      localStorage.removeItem('joinedChats');
      localStorage.removeItem('notJoinedChats');
      localStorage.removeItem('currentChatId');      
    }
  }

  openExternalWindow(): void {
    this.socketService.bind('openExternalChatCallback', (data: any) => {
      this.socketService.unbind('openExternalChatCallback');
      this.socketService.emit('openExternalChat', {linkedSocketId: data.externalWindowSocketid});
    });
    localStorage.setItem('joinedChats', JSON.stringify(this.chatService.joinedChatList));
    localStorage.setItem('notJoinedChats', JSON.stringify(this.chatService.notJoinedChatList));
    localStorage.setItem('socketId' , this.socketService.socket.id);
    localStorage.setItem('isExternalWindow', 'true');
    localStorage.setItem('currentChatId', this.chatService.currentChatId);
    this.chatService.isChatInExternalWindow = true;
    let BrowserWindow = this.electronService.remote.BrowserWindow
    this.gameService.chatWindow = new BrowserWindow({
      width: 384,
      height: 840,
      resizable: false,
    })
    this.gameService.chatWindow.loadURL('file://' + __dirname + '/index.html#/chat');
    let chatBar = document.getElementById('chat-bar');
    if(chatBar){
      chatBar.style.display = 'none';
    }
    this.gameService.chatWindow.on('close', () => {
      this.socketService.emit('closeExternalChat', {mainWindowId: this.socketService.socketId});
      localStorage.removeItem('joinedChats');
      localStorage.removeItem('socketId');
      this.chatService.isChatInExternalWindow = false;
      let chatBar = document.getElementById('chat-bar');
      if(chatBar){
        chatBar.style.display = 'block';
      }
      this.chatService.isClosingExternalWindow = true; 
      let currentUrl = this.router.url;
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.ngZone.run(() => this.router.navigate([currentUrl]))
    })
  }

  
  createChat(): void {
    if(this.createChatForm.value.chatName == "" || !this.createChatForm.value.chatName) return;
    if(this.createChatForm.valid) {
      this.chatService.createChat(this.createChatForm.value.chatName);
    } else {
      this.snackBar.open("Le nom du canal doit être en 1 et 12 charactères!", "", {
        duration: 2000,
      });
    }
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

  isGameChat(): boolean {
    try {
      if(this.chatService.joinedChatList[this.chatService.index].isGameChat){
        return true
      } else {
        return false;
      }
    } catch {
      return false;
    }
  }
}
