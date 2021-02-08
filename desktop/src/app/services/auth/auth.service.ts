import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '@app/classes/user';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loginUrl = "http://18.217.235.167:3000/api/auth/authenticate"
  private registerUrl = "http://18.217.235.167:3000/api/auth/register"

  constructor(private http: HttpClient, private router: Router) { }

  login(user: User) {
    return this.http.post<any>(this.loginUrl, user)
  }

  register(user: User) {
    console.log(user);
    return this.http.post<any>(this.registerUrl, user);
  }

  logoutUser() {
    localStorage.removeItem('token');
    this.router.navigate(['/login'])
  }

  loggedIn() {
    return !!localStorage.getItem('token') // We need to verify with the server if the token is valid
  }

  getToken() {
    return localStorage.getItem('token');
  }
}
