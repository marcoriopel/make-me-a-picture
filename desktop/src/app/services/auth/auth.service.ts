import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '@app/classes/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loginUrl = "http://18.217.235.167:3000/login/"

  constructor(private http: HttpClient) { }

  login(user: User) {
    console.log(user.username);
    return this.http.post<any>(this.loginUrl, user)
  }
}
