import { Component, OnInit } from '@angular/core';
import { GameService } from '@app/services/game/game.service';

@Component({
  selector: 'app-end-game-drawing',
  templateUrl: './end-game-drawing.component.html',
  styleUrls: ['./end-game-drawing.component.scss']
})
export class EndGameDrawingComponent implements OnInit {

  virtualPlayerDrawings: any[] = [];
  realPlayerDrawings: any[] = [];

  result: string = "";
  winningTeam: any;
  loosingTeam: any;
  drawTeam1: any;
  drawTeam2: any;

  constructor(private gameService: GameService) {
    this.virtualPlayerDrawings = this.gameService.virtualPlayerDrawings;
    this.realPlayerDrawings = this.realPlayerDrawings;
   }

  ngOnInit(): void {
    if(this.gameService.score[0] > this.gameService.score[1]){
      // Team 1 win
      if(this.gameService.teams.team1.includes(this.gameService.username as string)){
        this.result = 'Victoire'
      }

      this.winningTeam = {
        score: this.gameService.score[0],
        players: this.gameService.teams.team1,
      }

      this.loosingTeam = {
        score: this.gameService.score[1],
        players: this.gameService.teams.team2,
      }

    } else if(this.gameService.score[1] > this.gameService.score[0]){
      // Team 2 win
      if(this.gameService.teams.team1.includes(this.gameService.username as string)){
        this.result = 'Défaite'
      }

      this.winningTeam = {
        score: this.gameService.score[1],
        players: this.gameService.teams.team2,
      }

      this.loosingTeam = {
        score: this.gameService.score[0],
        players: this.gameService.teams.team1,
      }

    } else {
      // Draw
      this.result = "Partie nulle";

      this.drawTeam1 = {
        score: this.gameService.score[0],
        players: this.gameService.teams.team1,
      }

      this.drawTeam2 = {
        score: this.gameService.score[1],
        players: this.gameService.teams.team2,
      }
    }
  }

  upVote(): void {
    console.log('upvote')
  }

  downVote(): void {
    console.log('downVote')
  }

  quit(): void {
    console.log('quit')
  }

}
