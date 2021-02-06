import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-chat-bar',
  templateUrl: './chat-bar.component.html',
  styleUrls: ['./chat-bar.component.scss']
})
export class ChatBarComponent  {

  @ViewChild("box") inputBox: ElementRef;

  chat: string[] = [];

  constructor() { }

  sendMessage(message: string): void {
    this.chat.push(message);
    this.inputBox.nativeElement.value = "";
  }

}
