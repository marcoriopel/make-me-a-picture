import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SearchGameService } from '@app/services/search-game/search-game.service';

@Component({
  selector: 'app-game-search',
  templateUrl: './game-search.component.html',
  styleUrls: ['./game-search.component.scss']
})
export class GameSearchComponent implements OnInit {

  private emptyOrSpaceRegex: string = "^\\s+$";
  filter = new Map([
    ["classic", true],
    ["sprint", true],
    ["easy", true],
    ["normal", true],
    ["hard", true]
  ])

  sprintImgRef: string = "../../../assets/img/sprintLogo.png";
  classicBlackImgRef: string =  "../../../assets/img/classicLogoBlack.png";
  allLogoBlackImgRef: string =  "../../../assets/img/allLogoBlack.png";
  easyImgRef: string =  "../../../assets/img/easyLogo.png";
  normalImgRef: string =  "../../../assets/img/normalLogo.png";
  hardImgRef: string =  "../../../assets/img/hardLogo.png";

  searchForm = this.formBuilder.group({
    gameNameOrId: ''
  })
  constructor(private formBuilder: FormBuilder, public searchGameService: SearchGameService) { }

  ngOnInit(): void {
    this.searchGameService.fetchGameList();
  }

  filterGameType(filter: string): void {
    // Change togle
    this.filter.set(filter, !this.filter.get(filter));
    // Filter game list
    this.searchGameService.filterGame(this.filter);
  }

  filterName(gameName: any): void {
    // Reset filter toggle
    this.filter.forEach((value: boolean, key: string)=> {this.filter.set(key, true);});
    if (gameName.match(this.emptyOrSpaceRegex) || !gameName) {
      this.searchGameService.displayAllGame();
    } else {
      this.searchGameService.filterName(gameName);
    }
  }

}
