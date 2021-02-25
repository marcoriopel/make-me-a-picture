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
