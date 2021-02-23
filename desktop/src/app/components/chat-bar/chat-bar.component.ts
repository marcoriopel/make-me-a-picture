import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormBuilder } from '@angular/forms';
import { io, Socket } from "socket.io-client";

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

  constructor(private formBuilder: FormBuilder) {
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
      this.chat.push({"username": message.username, "avatar": message.avatar, "text": message.text, "timeStamp": message.timeStamp, "isUsersMessage": isUsersMessage, "textColor": message.textColor});
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
    const avatar = parseInt(localStorage.getItem('avatar') as string);
    this.socket.emit('message', {"text": this.messageForm.value.message,"token": jwt, "avatar": avatar});
    this.messageForm.reset();
  }

}
