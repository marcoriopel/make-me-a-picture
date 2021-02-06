import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { io, Socket } from "socket.io-client";

@Component({
  selector: 'app-chat-bar',
  templateUrl: './chat-bar.component.html',
  styleUrls: ['./chat-bar.component.scss']
})
export class ChatBarComponent implements OnInit {

  @ViewChild("box") inputBox: ElementRef;

  chat: string[] = [];
  socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000');
  }


  ngOnInit(): void {
    this.socket.on("connect", () => {
      console.log(this.socket.id); // x8WIv7-mJelg7on_ALbx
    });

    this.socket.on('message', (text: string) => {
      this.chat.push(text);
    });

  }

  sendMessage(message: string): void {
    this.socket.emit('message', message);
    this.inputBox.nativeElement.value = "";
  }

}
