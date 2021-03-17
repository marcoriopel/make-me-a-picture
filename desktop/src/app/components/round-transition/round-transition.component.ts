import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameService } from '@app/services/game/game.service';

@Component({
  selector: 'app-round-transition',
  templateUrl: './round-transition.component.html',
  styleUrls: ['./round-transition.component.scss']
})
export class RoundTransitionComponent implements OnInit {

  message: string = "";

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public gameService: GameService) {

    console.log(data.state);
    console.log(gameService.drawingPlayer)
    switch (data.state) {
      case 0:
        this.message = "Bienvenue dans la partie! C'est " + this.gameService.drawingPlayer + " qui commence à dessiner!";
        break;
      
      case 1:
        this.message = this.gameService.guessingPlayer + " s'est trompé! Droit de réplique!";
        break;

      case 2:
          this.message = "Prochain round!!! C'est à " + this.gameService.drawingPlayer + " de dessiner!";
          break;
    }
  } 

  ngOnInit(): void {
  }

}
