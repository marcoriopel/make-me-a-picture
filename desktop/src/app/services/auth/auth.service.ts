import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '@app/classes/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loginUrl = "http://localhost:3000/login/"

  constructor(private http: HttpClient) { }

  login(user: User) {
    return this.http.post<any>(this.loginUrl, user)
  }
}
