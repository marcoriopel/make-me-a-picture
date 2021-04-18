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


  constructor(public lobbyService: LobbyService, private gameService: GameService, private chatService: ChatService, private socketService: SocketService) { }

  ngOnInit(): void {
    
  }

  ngOnDestroy(): void {
    this.socketService.emit('leaveLobby', {'lobbyId': this.gameService.gameId});
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

  leaveLobby(): void {
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
