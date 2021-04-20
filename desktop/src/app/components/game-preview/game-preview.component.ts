import { Component, ElementRef, Input, Output, Renderer2, ViewChild, EventEmitter } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { AvailableGame } from '@app/classes/game';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { SocketService } from '@app/services/socket/socket.service';
import { Router } from '@angular/router';
import { GameService } from '@app/services/game/game.service';
import { ChatService } from '@app/services/chat/chat.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-game-preview',
  templateUrl: './game-preview.component.html',
  styleUrls: ['./game-preview.component.scss'],
  animations: [
    trigger(
      'inOutAnimation', 
      [
        transition(
          ':enter', 
          [
            style({ height: 35, opacity: 0 }),
            animate('1s ease-out', 
                    style({ height: 35, opacity: 1 }))
          ]
        ),
        transition(
          ':leave', 
          [
            style({ height: 300, opacity: 1 }),
            animate('1s ease-in', 
                    style({ height: 0, opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class GamePreviewComponent{

  classicGreyImgRef: string = "./assets/img/classicLogoWhite.png"
  sprintImgRef: string = "./assets/img/sprintLogo.png";
  coopImgRef: string = "./assets/img/hands-helping-solid-light.svg";

  @ViewChild("gamePreview") gamePreviewRef: ElementRef;
  @Input() game: AvailableGame;
  @Output() closeAllPreview: EventEmitter<any> = new EventEmitter();
  
  players: any[];

  isPreview: boolean = false;

  constructor(private renderer: Renderer2, private lobbyService: LobbyService, private socketService: SocketService, private router: Router, private gameService: GameService, private chatService: ChatService, private snackBar: MatSnackBar) {}

  preview() {
    if (this.isPreview) {
      this.renderer.removeClass(this.gamePreviewRef.nativeElement, "game-preview");
      this.socketService.unbind('dispatchTeams');
    } else {
      this.closeAllPreview.emit();
      this.renderer.addClass(this.gamePreviewRef.nativeElement, "game-preview");
      this.socketService.emit('listenLobby', {oldLobbyId: this.lobbyService.oldLobbyId, lobbyId: this.game.id});
      this.lobbyService.oldLobbyId = this.game.id;
      this.socketService.bind('dispatchTeams', (res: any) => {
          this.players = res.players;
      });
    }
    this.isPreview = !this.isPreview;
  }

  closePreview(): void {
    if (this.isPreview) {
      this.renderer.removeClass(this.gamePreviewRef.nativeElement, "game-preview");
      this.socketService.unbind('dispatchTeams');
      this.isPreview = false;
    }
  }

  join() {
    this.closePreview();
    const game = {
      gameType: this.game.gameType,
      gameName: this.game.gameName,
      difficulty: this.game.difficulty
    }
    this.lobbyService.joinPublicGame(this.game.id, game).subscribe(
      res => {
        this.gameService.gameId = this.game.id;
        this.router.navigate(['/lobby']);
        this.socketService.emit('joinLobby', {lobbyId:this.game.id});
        this.gameService.initialize(game.gameType);

        this.socketService.bind('joinChatRoomCallback', async () => {
          await this.chatService.refreshChatList();
          this.chatService.setCurrentChat(this.game.id);
          this.socketService.unbind('joinChatRoomCallback')
        });
        this.chatService.joinChat(this.game.id);

      },
      err => {
        this.snackBar.open("Impossible de rejoindre le lobby", "", {
          duration: 2000,
        });
      }
    );
  }
}
