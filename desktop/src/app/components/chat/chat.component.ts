import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ChatService } from "@app/services/chat/chat.service"

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})

export class ChatComponent implements OnInit {

  @ViewChild("chatContainer") chatContainer: ElementRef;

  messageForm = this.formBuilder.group({
    message: '',
  })

  constructor(private formBuilder: FormBuilder, public chatService: ChatService) {}

  ngOnInit(): void {
    // this.chatService.connectToChat(environment.socket_url);
  }

  connectToChat(url: string): void {
    this.chatService.connectToChat(url);
  }

  onNewMessage(): void {
    this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
  }

  onSubmit(): void {
    if(this.messageForm.value.message == "" || this.messageForm.value.message == null){
      this.messageForm.reset();
      return;
    } 
    this.chatService.sendMessage(this.messageForm.value.message);
    this.messageForm.reset();
  }

}
