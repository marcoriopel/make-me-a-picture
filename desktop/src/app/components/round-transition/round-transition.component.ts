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
        setTimeout(() => {
          this.message = this.gameService.guessingPlayer + " s'est trompé! Droit de réplique!";          
        }, 500);
        break;

      case State.NEWROUND:
          this.message = "Prochain round!!! C'est à " + this.gameService.drawingPlayer + " de dessiner!";
          break;

      case State.ENDGAME:
        this.message = "Partie terminée! Vous avez eu un score de " + this.gameService.score[0];
        break;

      case State.MAXSCORE:
        this.message = "Vous avez eu un score de " + this.gameService.score[0];
        break;

      case State.SPRINTSTART:
        this.message = "Vous devez dessiner le plus de dessins possible. La partie va commencer dans:";
        break;
    }
  } 

  endGame(): void {
    this.router.navigate(['/home']);
  }

  ngOnInit(): void {
  }

}
