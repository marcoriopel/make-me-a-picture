import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { State } from '@app/ressources/global-variables/global-variables';
import { GameService } from '@app/services/game/game.service';

@Component({
  selector: 'app-round-transition',
  templateUrl: './round-transition.component.html',
  styleUrls: ['./round-transition.component.scss']
})
export class RoundTransitionComponent implements OnInit {

  message: string = "";
  state: State = State.GAMESTART;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public gameService: GameService, private router: Router) {
    this.state = data.state;
    switch (data.state) {
      case State.GAMESTART:
        this.message = "Bienvenue dans la partie! C'est " + this.gameService.drawingPlayer + " qui commence à dessiner!";
        break;
      
      case State.REPLY:
        this.message = this.gameService.guessingPlayer + " s'est trompé! Droit de réplique!";
        break;

      case State.NEWROUND:
          this.message = "Prochain round!!! C'est à " + this.gameService.drawingPlayer + " de dessiner!";
          break;

      case State.ENDGAME:
        this.message = "Partie terminée! Vous avez eu un score de " + this.gameService.score[0];
        break;
    }
  } 

  endGame(): void {
    this.gameService.numberOfDrawings == 0 ? this.router.navigate(['/home']) : this.gameService.openEndGameModal();
  }

  ngOnInit(): void {
  }

}
