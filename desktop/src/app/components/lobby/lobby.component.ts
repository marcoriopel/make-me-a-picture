import { Component, OnInit } from '@angular/core';
import { ChatService } from '@app/services/chat/chat.service';
import { LobbyService } from '@app/services/lobby/lobby.service';
@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent implements OnInit {

  classicBlackImgRef: string = "./assets/img/classicLogoBlack.png"
  sprintImgRef: string = "./assets/img/sprintLogo.png";
  coopImgRef: string = "./assets/img/hands-helping-solid.svg";


  constructor(public lobbyService: LobbyService, private chatService: ChatService) { }

  ngOnInit(): void {
    
  }

  leaveLobby(): void {
    this.lobbyService.quit();
    this.chatService.setCurrentChat("General");
  }
}
