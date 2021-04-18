import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '@app/classes/user';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { SHA256, enc } from 'crypto-js';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.api_url;
  private loginUrl = this.baseUrl + "/api/authenticate/login";
  private logoutUrl = this.baseUrl + "/api/authenticate/logout";
  private registerUrl = this.baseUrl + "/api/authenticate/register";

  constructor(private http: HttpClient, private router: Router) { }

  login(user: User) {
    user.password = enc.Base64.stringify(SHA256(user.password));
    return this.http.post<any>(this.loginUrl, user);
  }

  register(user: User) {
    user.password = enc.Base64.stringify(SHA256(user.password));
    return this.http.post<any>(this.registerUrl, user);
  }

  logoutUser() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': this.getToken()!,
    });
    const options = { headers: headers };
    this.http.post<any>(this.logoutUrl, null, options)
      .subscribe((data: any) => {
      });
    localStorage.removeItem('username');
    localStorage.removeItem('avatar');
    localStorage.removeItem('token');
    localStorage.removeItem('tutorial');
    this.router.navigate(['/login']);
    window.location.reload();
  }

  loggedIn() {
    return !!localStorage.getItem('token'); // We need to verify with the server if the token is valid
  }

  getToken() {
    return localStorage.getItem('token');
  }
}
