import { Component } from '@angular/core';
import { SearchGameService } from '@app/services/search-game/search-game.service'

@Component({
  selector: 'app-game-bar',
  templateUrl: './game-bar.component.html',
  styleUrls: ['./game-bar.component.scss']
})
export class GameBarComponent {

  sprintImgRef: string = "../../../assets/img/sprintLogo.png";
  classicBlackImgRef: string =  "../../../assets/img/classicLogoBlack.png";
  allLogoBlackImgRef: string =  "../../../assets/img/allLogoBlack.png";

  easyImgRef: string =  "../../../assets/img/easyLogo.png";
  normalImgRef: string =  "../../../assets/img/normalLogo.png";
  hardImgRef: string =  "../../../assets/img/hardLogo.png";

  toggleClassic = true;
  toggleSprint = true;
  toggleEasy = true;
  toggleNormal = true;
  toggleHard = true;


  constructor(public searchGameService: SearchGameService) { }

  classic():void {
    console.log('Classic game selected');
  }

  sprintSolo():void {
    console.log('Sprint Solo game selected');
  }

  sprintCoop():void {
    console.log('Sprint Coop game selected');
  }

  createWordImage():void {
    console.log('Create Word Image selected');
  }

}
