import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
    this.socket = io('http://18.217.235.167:3000/:3000/');
  }

  ngOnInit(): void {
    this.socket.on("connect", () => {
      console.log(this.socket.id);
    });

    this.socket.on('message', (message: any) => {
      let isUsersMessage: boolean = false;
      if(message.id === this.socket.id) {
        isUsersMessage = true
      } else {
        isUsersMessage = false;
      }
      this.chat.push({"text": message.text,"isUsersMessage": isUsersMessage});
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
    this.socket.emit('message', this.messageForm.value.message);
    this.messageForm.reset();
  }

}
