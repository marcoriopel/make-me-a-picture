import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ChatService } from "@app/services/chat/chat.service"

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})

export class ChatComponent {
  @ViewChild("chatContainer") chatContainer: ElementRef;
  @ViewChild("input") input: ElementRef;
  
  private onlySpaceRegExp = /^\s+$/;
  
  messageForm = this.formBuilder.group({
    message: '',
  })

  constructor(private formBuilder: FormBuilder, public chatService: ChatService) {
  }


  connectToChat(name: string): void {
    this.chatService.setCurrentChat(name);
  }

  onNewMessage(): void {
    let messageScroller = document.getElementById('message-scroller');
    if(messageScroller) {
      messageScroller.scrollTop = messageScroller.scrollHeight;
    }
  }

  onSubmit(): void {
    this.input.nativeElement.focus();
    if(this.messageForm.value.message == "" || this.messageForm.value.message == null || this.messageForm.value.message.match(this.onlySpaceRegExp)){
      this.messageForm.reset();
      return;
    } 
    this.chatService.sendMessage(this.messageForm.value.message);
    this.messageForm.reset();
  }

  loadChatHistory(): void {
    this.chatService.loadChatHistory();
  }

  isChatHistoryDisplayed(): boolean {
    try {
      return this.chatService.joinedChatList[this.chatService.index].isChatHistoryDisplayed;
    } catch {
      return false;
    }
  }

  deleteChat(): void {
    this.chatService.deleteChat();
  }
}
