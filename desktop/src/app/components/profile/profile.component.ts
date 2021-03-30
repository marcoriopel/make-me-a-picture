import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private getUserInfoUrl = environment.api_url + '/api/stats/private';
  category = new FormControl();
  userInfo: any;
  avatar: number | null;
  username: string | null;

  constructor(private http: HttpClient) { 
  }

  ngOnInit(): void {
    let av = localStorage.getItem('avatar');
    if(av) this.avatar = parseInt(av);
    this.username = localStorage.getItem('username');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem('token')!});
    const options = { headers: headers};
    this.http.get<any>(this.getUserInfoUrl, options).subscribe((data: any) => {
      this.userInfo = data.privateInfo;
      console.log(this.userInfo);
    })
  }

  updateData(): void {
    console.log(this.category.value)
  }

}
