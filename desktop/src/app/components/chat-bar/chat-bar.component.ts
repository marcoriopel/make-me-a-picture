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
    // this.socket.on("connect", () => {
    //   const jwt = localStorage.getItem('token');
    //   this.socket.emit('message', {"token": jwt});
    // });

    this.socket.on('message', (message: any) => {
      let isUsersMessage: boolean = false;
      if(message.id === this.socket.id) {
        isUsersMessage = true
      } else {
        isUsersMessage = false;
      }
      this.chat.push({"username": message.username, "text": message.text, "isUsersMessage": isUsersMessage, "textColor": message.textColor});
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

}
