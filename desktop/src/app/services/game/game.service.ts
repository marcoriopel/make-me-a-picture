import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DrawingService } from '../drawing/drawing.service';
import { SocketService } from '../socket/socket.service';

interface Player {
  username: string;
  avatar: number;
  isVirtual: boolean;
  team: number;
}

interface Teams {
  "team1": string[],
  "team2": string[],
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  isInGame: boolean = false;
  score: number[] = [0, 0];
  drawingPlayer: string;
  gameId: string;
  username: string | null;
  drawingName: string = "";
  teams: Teams;
  isGuessing: boolean = false;
  currentUserTeam: number;
  timer: number = 69;

  constructor(private socketService: SocketService, private router: Router, private drawingService: DrawingService) {
    this.username = localStorage.getItem('username');
  }

  initialize(): void {
    this.socketService.bind('gameStart', (data: any) => {
      this.isInGame = true;
      this.drawingPlayer = data.player;

      this.teams = {
        team1: [],
        team2: [],
      }

      data.teams.forEach((player: Player) => {
        player.team == 0 ? this.teams.team1.push(player.username) : this.teams.team2.push(player.username);
        if (player.username == this.username) {
          this.currentUserTeam = player.team;
        }
      });
      console.log(this.teams);
      this.router.navigate(['/game']);
    })

    this.socketService.bind('score', (data: any) => {
      this.score = data.score;
    })

    this.socketService.bind('drawingName', (data: any) => {
      this.drawingName = data.drawingName;
      console.log('Socket: drawingName');
      console.log(data);
    })

    this.socketService.bind('guessesLeft', (data: any) => {
      console.log('Socket: guessesLeft');
      console.log(data);
      if (this.username) {
        if (data.guessesLeft[this.currentUserTeam] == 1 && this.drawingPlayer != this.username) {
          this.isGuessing = true;
        } else {
          this.isGuessing = false;
        }
      }
    })

    this.socketService.bind('guessCallback', (data: any) => {
      //TODO handle guessCallback, data contains { "isCorrectGuess": boolean, "guessingPlayer": string }
      console.log('Socket: guessCallback');
      console.log(data);
    })

    this.socketService.bind('newRound', (data: any) => {
      this.drawingPlayer = data.newDrawingPlayer;
      this.drawingService.clearCanvas(this.drawingService.baseCtx);
      this.drawingService.strokeStack = [];
      this.drawingService.redoStack = [];
      console.log('Socket: newRound');
      console.log(data);
    })

    this.socketService.bind('endGame', (data: any) => {
      //TODO handle endGame, data contains { "finalScore": number[] }
      console.log('Socket: endGame');
      console.log(data);
    })

    this.socketService.bind('timer', (data: any) => {
      this.timer = data.timer;
    })
  }
}
