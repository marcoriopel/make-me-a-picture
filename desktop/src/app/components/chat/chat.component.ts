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

  isGameChat(): boolean {
    try {
      if(this.chatService.joinedChatList[this.chatService.index].isGameChat){
        return true
      } else {
        return false;
      }
    } catch {
      return false;
    }
  }
}
