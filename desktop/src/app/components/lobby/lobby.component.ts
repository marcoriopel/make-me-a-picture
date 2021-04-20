import { Component, OnInit } from '@angular/core';
import { ChatService } from '@app/services/chat/chat.service';
import { GameService } from '@app/services/game/game.service';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { SocketService } from '@app/services/socket/socket.service';
@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent implements OnInit {

  classicBlackImgRef: string = "./assets/img/classicLogoBlack.png"
  sprintImgRef: string = "./assets/img/sprintLogo.png";
  coopImgRef: string = "./assets/img/hands-helping-solid.svg";


  constructor(public lobbyService: LobbyService, private gameService: GameService, public chatService: ChatService, private socketService: SocketService) { }

  ngOnInit(): void {
    
  }

  ngOnDestroy(): void {
    if(!this.gameService.isInGame && !this.chatService.isClosingExternalWindow){
      this.leaveLobby();
    } else {
      this.chatService.isClosingExternalWindow = false;
    }
  }

  leaveLobby(): void {
    this.lobbyService.lobbyInviteId = '';
    this.lobbyService.quit();
    this.chatService.setCurrentChat("General");
    this.socketService.unbind('drawingEvent');
    this.socketService.unbind('eraserStrokes');
    this.socketService.unbind('transitionTimer');
    this.socketService.unbind('drawingName');
    this.socketService.unbind('timer');
    this.socketService.unbind('newRound');
    this.socketService.unbind('guessCallBack');
    this.socketService.unbind('guessesLeft');
    this.socketService.unbind('score');
    this.socketService.unbind('gameStart');
    this.socketService.unbind('endGame');
  }
}
