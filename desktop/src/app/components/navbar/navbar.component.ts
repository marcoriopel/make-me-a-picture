import { Component } from '@angular/core';
import { AuthService } from '@app/services/auth/auth.service';
import { ChatService } from '@app/services/chat/chat.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  constructor(private authService: AuthService, private chatService: ChatService) { }

  logout(): void {
    this.authService.logoutUser();
    this.chatService.deconnect();
  }

}
