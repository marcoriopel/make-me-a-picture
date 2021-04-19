import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { GameType } from '@app/classes/game';
import { environment } from 'src/environments/environment';
import { formatDateString, formatMeanTimePlayed, formatTimePlayed } from '@app/classes/date';
import { ChatService } from '@app/services/chat/chat.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private getUserInfoUrl = environment.api_url + '/api/stats/private';
  category: string = '0';
  userInfo: any;
  avatar: number | null;
  username: string | null;

  constructor(private http: HttpClient, public chatService: ChatService) { 
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
            game.gameType = 'Coop';
            game.players[1] = '';
            break;
          case GameType.SprintSolo:
            game.gameType = 'Solo';
            game.players[1] = '';
            break;
        }
      });
      data.privateInfo.stats.timePlayed = formatTimePlayed(data.privateInfo.stats.timePlayed);
      data.privateInfo.stats.meanGameTime = formatMeanTimePlayed(data.privateInfo.stats.meanGameTime);
      data.privateInfo.stats.classicWinRatio = data.privateInfo.stats.classicWinRatio.toFixed(2);

      data.privateInfo.logs.forEach((element:any) => {
        element.isLogin ? element.isLogin = "Connexion" : element.isLogin = "Déconnexion";
        element.timestamp = formatDateString(element.timestamp);
      });

      this.userInfo = data.privateInfo;
      this.userInfo.games = this.userInfo.games.reverse();
      this.userInfo.logs = this.userInfo.logs.reverse();
    })
  }

  onValChange(val: string){
    this.category = val;
  }
}
