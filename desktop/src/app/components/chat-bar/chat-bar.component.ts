import { Component, OnInit } from '@angular/core';
import { ChatService } from '@app/services/chat/chat.service'

@Component({
  selector: 'app-chat-bar',
  templateUrl: './chat-bar.component.html',
  styleUrls: ['./chat-bar.component.scss']
})

export class ChatBarComponent implements OnInit {

  constructor(public chatService: ChatService) {}

  changeChat(name: string): void {
    this.chatService.setCurrentChat(name)
  }

  ngOnInit(): void {
  }


}
