import { Component, OnInit } from '@angular/core';
import { LobbyService } from '@app/services/lobby/lobby.service';
@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {

  classicBlackImgRef: string = "../../../assets/img/classicLogoBlack.png"
  sprintImgRef: string = "../../../assets/img/sprintLogo.png";

  constructor(public lobbyService: LobbyService) { }

  ngOnInit(): void {
  }

}
