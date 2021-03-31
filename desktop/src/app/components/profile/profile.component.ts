import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GameType } from '@app/classes/game';
import { environment } from 'src/environments/environment';
import { formatDateString, formatTimePlayed } from '@app/classes/date';

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
      data.privateInfo.games.forEach((game: any) => {

        game.team1 = [];
        game.team2 = [];

        game.players.forEach((player: any) => {
          player.team == 0 ? game.team1.push(player.username) : game.team2.push(player.username);
        });

        game.end = formatDateString(game.end);

        switch(game.gameType) {
          case GameType.Classic:
            game.gameType = 'Classic';
            break;
          case GameType.SprintCoop:
            game.players[1] = '';
            game.gameType = 'Coop';
            break;
          case GameType.SprintSolo:
            game.players[1] = '';
            game.GameType = 'Solo';
            break;
        }
      });
      data.privateInfo.stats.timePlayed = formatTimePlayed(data.privateInfo.stats.timePlayed);
      data.privateInfo.stats.meanGameTime = formatTimePlayed(data.privateInfo.stats.meanGameTime);
      this.userInfo = data.privateInfo;
      console.log(this.userInfo);
    })
  }

  updateData(): void {
    console.log(this.category.value)
  }

}
