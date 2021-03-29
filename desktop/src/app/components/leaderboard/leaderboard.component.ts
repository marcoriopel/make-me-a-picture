import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LeaderboardCategory } from '@app/ressources/global-variables/global-variables';
import { FormControl } from '@angular/forms';
@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {
  private getLeadboardStatsUrl = environment.api_url + '/api/stats/leaderboard';
  category = new FormControl();
  leaderboard: any = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem('token')!});
    let params = new HttpParams();
    params = params.append('category', LeaderboardCategory.BEST_SOLO_SCORE.toString());    
    const options = { params: params, headers: headers};
    this.http.get<any>(this.getLeadboardStatsUrl, options).subscribe((data: any) => {
    })
  }

  updateLeaderboard(): void {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem('token')!});
    let params = new HttpParams();
    switch(this.category.value){
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
    }
    const options = { params: params, headers: headers};
    this.http.get<any>(this.getLeadboardStatsUrl, options).subscribe((data: any) => {
      this.leaderboard = data.top10;
    })
  }

}
