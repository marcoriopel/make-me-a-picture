import { Component } from '@angular/core';
import { AuthService } from '@app/services/auth/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  username: string | null;
  constructor(private authService: AuthService) { 
    this.username = localStorage.getItem('username');
  }

  logout(): void {
    this.authService.logoutUser();
  }

}
