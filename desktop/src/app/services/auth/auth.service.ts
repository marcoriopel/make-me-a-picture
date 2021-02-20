import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '@app/classes/user';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.api_url;
  private loginUrl = this.baseUrl + "/api/auth/authenticate";
  private registerUrl = this.baseUrl + "/api/auth/register";

  constructor(private http: HttpClient, private router: Router) { }

  login(user: User) {
    return this.http.post<any>(this.loginUrl, user);
  }

  register(user: User) {
    return this.http.post<any>(this.registerUrl, user);
  }

  logoutUser() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.router.navigate(['/login'])
  }

  loggedIn() {
    return !!localStorage.getItem('token') // We need to verify with the server if the token is valid
  }

  getToken() {
    return localStorage.getItem('token');
  }
}
