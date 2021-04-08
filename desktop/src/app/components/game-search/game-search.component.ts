import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SearchGameService } from '@app/services/search-game/search-game.service';
import { GamePreviewComponent } from '../game-preview/game-preview.component';
import { JoinPrivateGameComponent } from '../join-private-game/join-private-game.component';

@Component({
  selector: 'app-game-search',
  templateUrl: './game-search.component.html',
  styleUrls: ['./game-search.component.scss']
})
export class GameSearchComponent implements OnInit {
  joinPrivateGameRef: any;

  private emptyOrSpaceRegex: string = "^\\s+$";
  filter = new Map([
    ["classic", true],
    ["sprint", true],
    ["easy", true],
    ["normal", true],
    ["hard", true]
  ])

  @ViewChildren('preview') previews: QueryList<GamePreviewComponent>;

  sprintImgRef: string = "./assets/img/sprintLogo.png";
  coopImgRef: string = "./assets/img/hands-helping-solid.svg";
  classicBlackImgRef: string =  "./assets/img/classicLogoBlack.png";
  classicGreyImgRef: string = "./assets/img/classicLogoWhite.png"
  allLogoBlackImgRef: string =  "./assets/img/allLogoBlack.png";
  easyImgRef: string =  "./assets/img/easyLogo.png";
  normalImgRef: string =  "./assets/img/normalLogo.png";
  hardImgRef: string =  "./assets/img/hardLogo.png";

  searchForm = this.formBuilder.group({
    gameNameOrId: ''
  })
  constructor(private formBuilder: FormBuilder, public searchGameService: SearchGameService, public dialog: MatDialog) { }

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

  closeAllPreview(): void {
    this.previews.forEach(preview => {
      preview.closePreview();
    });
  }

  onRefreshClick(): void {
    this.searchGameService.fetchGameList();
  }

  joinPrivateGame(): void {
    this.joinPrivateGameRef = this.dialog.open(JoinPrivateGameComponent, {
      height: '400px',
      width: "600px"
    })
  }

}
