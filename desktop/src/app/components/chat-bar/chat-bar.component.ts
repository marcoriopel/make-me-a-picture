import { Component, OnInit } from '@angular/core';
import { ElectronService } from "ngx-electron";
import { ChatService } from '@app/services/chat/chat.service'

@Component({
  selector: 'app-chat-bar',
  templateUrl: './chat-bar.component.html',
  styleUrls: ['./chat-bar.component.scss']
})

export class ChatBarComponent implements OnInit {

  isWindowButtonAvailable: boolean = true;

  constructor(public chatService: ChatService, private electronService: ElectronService) {}

  changeChat(name: string): void {
    this.chatService.setCurrentChat(name)
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
    chatWindow.on('close', () => {
      this.chatService.isChatInExternalWindow = false;
    })
  }

}
