import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SearchGameService } from '@app/services/search-game/search-game.service';

@Component({
  selector: 'app-game-search',
  templateUrl: './game-search.component.html',
  styleUrls: ['./game-search.component.scss']
})
export class GameSearchComponent implements OnInit {

  toggleClassic = true;
  toggleSprint = true;
  toggleEasy = true;
  toggleNormal = true;
  toggleHard = true;

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
    // TODO: Get game list
  }

  filterGameType(type: string): void {
    switch(type) {
      case "classic":
        this.toggleClassic = !this.toggleClassic;
        break;
      case "sprint":
        this.toggleSprint = !this.toggleSprint;
        break;
      case "easy":
        this.toggleEasy = !this.toggleEasy;
        break;
      case "normal":
        this.toggleNormal = !this.toggleNormal;
        break;
      case "hard":
        this.toggleHard = !this.toggleHard;
        break;
    }
  }

  filterName(name: any): void {
    this.searchGameService.filterName(name);
  }

}
