import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchGameService {

  private gameList: any[] = []
  displayList: any[] = []

  constructor() {
    // TODO: Get game list
    this.gameList = [
      {name: 'Game 1', type: 'classic', difficulty: 'normal'},
      {name: 'Game 2', type: 'sprint', difficulty: 'hard'},
      {name: 'Game 3', type: 'sprint', difficulty: 'easy'},
      {name: 'Game 4', type: 'classic', difficulty: 'mushroom'},
      {name: 'Game 5', type: 'classic', difficulty: 'hard'},
    ]
    this.displayList = this.gameList;
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
  
}
