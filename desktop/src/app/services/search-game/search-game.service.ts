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
      {name: 'Game 1', type: 'classic', difficulty: 'noraml'},
      {name: 'Game 2', type: 'solo', difficulty: 'hard'},
      {name: 'Game 3', type: 'coop', difficulty: 'easy'},
      {name: 'Game 4', type: 'solo', difficulty: 'mushroom'},
      {name: 'Game 5', type: 'classic', difficulty: 'hard'},
    ]
    this.displayList = this.gameList;
  }

  filterType(type: string): void {
    this.filter('type', type);
  }

  filterName(name: string): void {
    console.log(name);
    this.filter('name', name);
  }

  filterDifficulty(difficulty: string): void {
    this.filter('difficulty', difficulty);
  }

  private filter(key: string, value: string): void {
    value = value.toLowerCase();
    this.displayList = [];
    this.gameList.forEach(game => game[key].toLowerCase() == value ? this.displayList.push(game): null);
  }
  
}
