import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LeaderboardCategory } from '@app/ressources/global-variables/global-variables';
import { formatTimePlayed } from '@app/classes/date';
import { ChatService } from '@app/services/chat/chat.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {
  private getLeadboardStatsUrl = environment.api_url + '/api/stats/leaderboard';
  selectedVal = '0';
  leaderboard: any = [];

  constructor(private http: HttpClient, public chatService: ChatService) { }

  ngOnInit(): void {
    this.updateLeaderboard("0");
  }

  isSelected(selectedIndex: string){
    if(selectedIndex === this.selectedVal) return "selected";
    else return "";
  }

  updateLeaderboard(value: string): void {
    this.selectedVal = value;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem('token')!});
    let params = new HttpParams();
    switch(value){
      case LeaderboardCategory.MOST_GAMES_PLAYED.toString():
        params = params.append('category', LeaderboardCategory.MOST_GAMES_PLAYED.toString());
        break;

      case LeaderboardCategory.MOST_TIME_PLAYED.toString():
        params = params.append('category', LeaderboardCategory.MOST_TIME_PLAYED.toString());
        break;

      case LeaderboardCategory.BEST_SOLO_SCORE.toString():
        params = params.append('category', LeaderboardCategory.BEST_SOLO_SCORE.toString());
        break;  

      case LeaderboardCategory.BEST_COOP_SCORE.toString():
        params = params.append('category', LeaderboardCategory.BEST_COOP_SCORE.toString());
        break;

      case LeaderboardCategory.BEST_CLASSIC_WIN_RATIO.toString():
        params = params.append('category', LeaderboardCategory.BEST_CLASSIC_WIN_RATIO.toString());
        break;

      case LeaderboardCategory.MOST_CLASSIC_GAMES_WON.toString():
        params = params.append('category', LeaderboardCategory.MOST_CLASSIC_GAMES_WON.toString());
        break;
    
      case LeaderboardCategory.MOST_UPVOTES.toString():
        params = params.append('category', LeaderboardCategory.MOST_UPVOTES.toString());
        break;
    }
    const options = { params: params, headers: headers};
    this.http.get<any>(this.getLeadboardStatsUrl, options).subscribe((data: any) => {
      data.top10.forEach((element: any) => {
        element.classicWinRatio = element.classicWinRatio.toFixed(2);
        element.timePlayed = formatTimePlayed(element.timePlayed);
      });
      this.leaderboard = data.top10;
    })
  }

}
