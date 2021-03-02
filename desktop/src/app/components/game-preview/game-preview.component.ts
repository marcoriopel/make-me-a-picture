import { Component, ElementRef, Input, Output, Renderer2, ViewChild, EventEmitter } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { AvailableGame } from '@app/classes/game';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { SocketService } from '@app/services/socket/socket.service';
import { Router } from '@angular/router';

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

  classicGreyImgRef: string = "../../../assets/img/classicLogoWhite.png"
  sprintImgRef: string = "../../../assets/img/sprintLogo.png";

  @ViewChild("gamePreview") gamePreviewRef: ElementRef;

  @Input() game: AvailableGame;
  @Output() closeAllPreview: EventEmitter<any> = new EventEmitter();
  players: any[];

  isPreview: boolean = false;

  constructor(private renderer: Renderer2, private lobbyService: LobbyService, private socketService: SocketService, private router: Router) {}

  preview() {
    if (this.isPreview) {
      this.renderer.removeClass(this.gamePreviewRef.nativeElement, "game-preview");
      this.socketService.unbind('dispatchTeams');
    } else {
      this.closeAllPreview.emit();
      this.renderer.addClass(this.gamePreviewRef.nativeElement, "game-preview");
      this.socketService.emit('listenLobby', {oldLobbyId: '', lobbyId: this.game.id});
      this.socketService.bind('dispatchTeams', (res: any) => {
          this.players = res.players;
          console.log(this.players);
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
    this.lobbyService.join(this.game.id).subscribe(
      res => {
        this.socketService.unbind('dispatchTeams');
        this.router.navigate(['/lobby']);
      },
      err => {
        console.log(err);
      }
    );
  }

}
