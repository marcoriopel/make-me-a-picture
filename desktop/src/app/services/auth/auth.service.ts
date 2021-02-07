import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User, NewUser } from '@app/classes/user';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loginUrl = "http://localhost:3000/api/authenticate"

  constructor(private http: HttpClient, private router: Router) { }

  login(user: User) {
    return this.http.post<any>(this.loginUrl, user)
  }

  register(user: NewUser) {
    console.log(user);
    return true;
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
