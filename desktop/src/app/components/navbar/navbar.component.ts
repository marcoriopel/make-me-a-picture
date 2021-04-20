import { Component } from '@angular/core';
import { AuthService } from '@app/services/auth/auth.service';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  username: string | null;
  avatar: string | null;

  constructor(private authService: AuthService) { 
    this.username = localStorage.getItem('username');
    this.avatar = localStorage.getItem('avatar');
  }

  logout(): void {
    this.authService.logoutUser();
  }

}
