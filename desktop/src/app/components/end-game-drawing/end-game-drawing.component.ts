import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ACCESS } from '@app/classes/acces';
import { GameService } from '@app/services/game/game.service';
import * as confetti from 'canvas-confetti';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-end-game-drawing',
  templateUrl: './end-game-drawing.component.html',
  styleUrls: ['./end-game-drawing.component.scss']
})
export class EndGameDrawingComponent implements OnInit {
  private baseUrl = environment.api_url;
  private voteUrl = this.baseUrl + '/api/drawings/vote'

  virtualPlayerDrawings: any[] = [];
  realPlayerDrawings: any[] = [];

  result: string = "";
  winningTeam: any;
  loosingTeam: any;
  drawTeam1: any;
  drawTeam2: any;

  constructor(private gameService: GameService, private http: HttpClient, private snackBar: MatSnackBar, private router: Router) {
    this.virtualPlayerDrawings = this.gameService.virtualPlayerDrawings;
    this.realPlayerDrawings = this.gameService.realPlayerDrawings;
   }

  ngOnInit(): void {
    if(this.gameService.score[0] > this.gameService.score[1]){
      // Team 1 win
      if(this.gameService.teams.team1.includes(this.gameService.username as string)){
        this.result = 'Victoire';
      } else {
        this.result = 'Défaite';
      }

      this.winningTeam = {
        score: this.gameService.score[0],
        players: this.gameService.teams.team1,
      }

      this.loosingTeam = {
        score: this.gameService.score[1],
        players: this.gameService.teams.team2,
      }

      let canvasEl = document.getElementById('confettiCanvas') as HTMLCanvasElement;
      var myConfetti = confetti.create(canvasEl, { 
        resize: true, 
        useWorker: true, 
      });
  
      myConfetti({
        spread: 180,
        particleCount: 200,
      });  

    } else if(this.gameService.score[1] > this.gameService.score[0]){
      if(this.gameService.teams.team1.includes(this.gameService.username as string)){
        this.result = 'Défaite';
      } else {
        this.result = 'Victoire';
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

  vote(id: string, isUpvote: boolean): void {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem(ACCESS.TOKEN)!
    });
    const options = { headers: headers, responseType: 'text' as 'json' };
    const body = { drawingId: id, isUpvote: isUpvote }
    this.http.patch<any>(this.voteUrl, body, options).subscribe(
      (res: any) => {
        console.log(res);
      },
      (err: any) => {
        console.log(err);
      }
    );
    this.snackBar.open("Votre vote est enregistré, merci!", "", {
      duration: 2000,
    });
  }

  quit(): void {
    console.log('quit')
    this.router.navigate(['/home']);
  }

}
