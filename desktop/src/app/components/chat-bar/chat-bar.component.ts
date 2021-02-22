import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormBuilder } from '@angular/forms';
import { io, Socket } from "socket.io-client";
import { ElectronService } from "ngx-electron";
import { ChatService } from '@app/services/chat/chat.service'

@Component({
  selector: 'app-chat-bar',
  templateUrl: './chat-bar.component.html',
  styleUrls: ['./chat-bar.component.scss']
})

export class ChatBarComponent implements OnInit {
  @ViewChild("chatContainer") chatContainer: ElementRef;

  messageForm = this.formBuilder.group({
    message: '',
  })

  chat: any[] = [];
  socket: Socket;

  constructor(private formBuilder: FormBuilder, private electronService: ElectronService, public chatService: ChatService) {
    this.socket = io(environment.socket_url);
    this.chatService.connectToChat(environment.socket_url);
  }
  
  changeChat(url: any): void {
    this.chatService.unbindMessage();
    this.chatService.connectToChat(url);
  }

  ngOnInit(): void {
  }


  onSubmit(): void {
    if(this.messageForm.value.message == "" || this.messageForm.value.message == null){
      this.messageForm.reset();
      return;
    } 
    const jwt = localStorage.getItem('token');
    this.socket.emit('message', {"text": this.messageForm.value.message,"token": jwt});
    this.messageForm.reset();
  }

  openExternalWindow(): void {
    this.chatService.isChatInExternalWindow = true;
    let BrowserWindow = this.electronService.remote.BrowserWindow
    let chatWindow = new BrowserWindow({
      width: 600,
      height: 840,
      resizable: false,
    })
    chatWindow.loadURL('file://' + __dirname + '/index.html#/chat');

    chatWindow.on('close', () => {
      this.chatService.isChatInExternalWindow = false;
    })
  }

}
