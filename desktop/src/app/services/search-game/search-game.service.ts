import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ACCESS } from '@app/classes/acces';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SearchGameService {

  private gameList: any[] = []
  displayList: any[] = []

  // URL
  private baseUrl = environment.api_url;
  private createGameUrl = this.baseUrl + "/api/games/list";
  

  constructor(private http: HttpClient) {
    // TODO: Get game list
    // this.gameList = [
    //   {name: 'Game 1', type: 'classic', difficulty: 'normal'},
    //   {name: 'Game 2', type: 'sprint', difficulty: 'hard'},
    //   {name: 'Game 3', type: 'sprint', difficulty: 'easy'},
    //   {name: 'Game 4', type: 'classic', difficulty: 'mushroom'},
    //   {name: 'Game 5', type: 'classic', difficulty: 'hard'},
    //   {name: 'Game 1', type: 'classic', difficulty: 'normal'},
    //   {name: 'Game 2', type: 'sprint', difficulty: 'hard'},
    //   {name: 'Game 3', type: 'sprint', difficulty: 'easy'},
    //   {name: 'Game 4', type: 'classic', difficulty: 'mushroom'},
    //   {name: 'Game 5', type: 'classic', difficulty: 'hard'},
    //   {name: 'Game 1', type: 'classic', difficulty: 'normal'},
    //   {name: 'Game 2', type: 'sprint', difficulty: 'hard'},
    //   {name: 'Game 3', type: 'sprint', difficulty: 'easy'},
    //   {name: 'Game 4', type: 'classic', difficulty: 'mushroom'},
    //   {name: 'Game 5', type: 'classic', difficulty: 'hard'},
    //   {name: 'Game 1', type: 'classic', difficulty: 'normal'},
    //   {name: 'Game 2', type: 'sprint', difficulty: 'hard'},
    //   {name: 'Game 3', type: 'sprint', difficulty: 'easy'},
    //   {name: 'Game 4', type: 'classic', difficulty: 'mushroom'},
    //   {name: 'Game 5', type: 'classic', difficulty: 'hard'},
    // ]
    this.getGames();
  }

  fetchGameList(): void {
    // TODO
    throw new Error('Method not implemented.');
  }

  displayAllGame(): void {
    this.displayList = this.gameList;
  }

  filterName(gameName: string): void {
    this.filter('name', gameName);
  }

  filterGame(filter: Map<string, boolean>): void {
    // TODO
    throw new Error('Method not implemented.');
  }

  joint(id: string) {
    throw new Error('Method not implemented.');
  }

  private filter(key: string, value: string): void {
    value = value.toLowerCase();
    this.displayList = [];
    this.gameList.forEach(game => game[key].toLowerCase() == value ? this.displayList.push(game): null);
  }
  
  private getGames(): void {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem(ACCESS.TOKEN)!});
    const options = { headers: headers };
    this.http.get<any>(this.createGameUrl, options).subscribe(
      res => {
        console.log(res);
        this.gameList = res.lobbies;
        this.displayList = this.gameList;
      },
      err => {
        console.log(err.error);
      }
    )

  }

}
