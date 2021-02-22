import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormBuilder } from '@angular/forms';
import { io, Socket } from "socket.io-client";
import { ElectronService } from "ngx-electron";
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

  constructor(private formBuilder: FormBuilder, private electronService: ElectronService) {
    this.socket = io(environment.socket_url);
  }

  ngOnInit(): void {
     this.socket.on('message', (message: any) => {
      let isUsersMessage: boolean = false;
      const username = localStorage.getItem('username');
      if (message.username === username) {
        isUsersMessage = true
      } else {
        isUsersMessage = false;
      }
      this.chat.push({"username": message.username, "text": message.text, "timeStamp": message.timeStamp, "isUsersMessage": isUsersMessage, "textColor": message.textColor});
    });
  }

  onNewMessage(): void {
    this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
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

  changeWindow(): void {
    // const chatWindow = new this.electronService.remote.BrowserWindow({width:800, height:600});
    // chatWindow.loadURL('hhtps://google.com');
    var BrowserWindow = this.electronService.remote.BrowserWindow
    var win = new BrowserWindow({
      width: 600,
      height: 840,
      resizable: false,
    })
    win.loadURL('file://' + __dirname + '/index.html#/chat');
  }

}
