import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ACCESS } from '@app/classes/acces';
import { Difficulty, GameType } from '@app/classes/game';
import { environment } from 'src/environments/environment';
// import { Difficulty } from '@app/classes/game'

@Injectable({
  providedIn: 'root'
})
export class SearchGameService {

  // Attribute
  gameList: any[] = []
  displayList: any[] = []
  currentPreviewId: string

  // URL
  private baseUrl = environment.api_url;
  private listGameUrl = this.baseUrl + "/api/games/list";
  

  constructor(private http: HttpClient) {
    this.fetchGameList();
  }

  fetchGameList(): void {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem(ACCESS.TOKEN)!});
    const options = { headers: headers };
    this.http.get<any>(this.listGameUrl, options).subscribe(
      res => {
        this.gameList = res.lobbies;
        this.displayList = this.gameList;
      },
      err => {
        console.log(err.error);
      }
    )
  }

  displayAllGame(): void {
    this.displayList = this.gameList;
  }

  filterName(gameName: string): void {
    this.filter('gameName', gameName);
  }

  filterGame(filter: Map<string, boolean>): void {
    let filteredList: any[] = [];
    this.displayList = [];
    this.gameList.forEach(game => {
      if (game.gameType == GameType.Classic && filter.get('classic')) 
        filteredList.push(game);
      if (game.gameType == GameType.SprintCoop && filter.get('sprint')) 
        filteredList.push(game);
    });
    filteredList.forEach(game => {
      if (game.difficulty == Difficulty.EASY && filter.get('easy'))
        this.displayList.push(game);
      if (game.difficulty == Difficulty.MEDIUM && filter.get('normal')) 
        this.displayList.push(game);
      if (game.difficulty == Difficulty.HARD && filter.get('hard')) 
        this.displayList.push(game);
    });
  }

  private filter(key: string, value: string): void {
    value = value.toLowerCase();
    this.displayList = [];
    this.gameList.forEach(game => {
      const name = game[key].toLowerCase();
      value = value.toLowerCase()
      name.includes(value) ? this.displayList.push(game): null;
    });
  }

}
