import { Component, OnInit } from '@angular/core';
import { ChatService } from '@app/services/chat/chat.service'
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-chat-bar',
  templateUrl: './chat-bar.component.html',
  styleUrls: ['./chat-bar.component.scss']
})

export class ChatBarComponent implements OnInit {

  constructor(public chatService: ChatService) {
    this.chatService.connectToChat(environment.socket_url);
  }

  changeChat(url: any): void {
    this.chatService.unbindMessage();
    this.chatService.connectToChat(url);
  }

  ngOnInit(): void {

  }


}
