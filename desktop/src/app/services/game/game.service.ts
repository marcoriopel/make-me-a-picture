import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '../socket/socket.service';

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

  constructor(private socketService: SocketService, private router: Router) {
    this.username = localStorage.getItem('username');
  }

  initialize(): void {
    this.socketService.bind('gameStart', (data: any) => {
      this.isInGame = true;
      this.drawingPlayer = data.player;
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
      //TODO handle guessesLeft, data contains { "guessesLeft": number[] } guessesLeft[0] is the number of guesses left for team1 and guessesLeft[1] is the number of guesses left for team2
      console.log('Socket: guessesLeft');
      console.log(data);
    })

    this.socketService.bind('guessCallback', (data: any) => {
      //TODO handle guessCallback, data contains { "isCorrectGuess": boolean, "guessingPlayer": string }
      console.log('Socket: guessCallback');
      console.log(data);
    })

    this.socketService.bind('newRound', (data: any) => {
      //TODO handle newRound, data contains { "newDrawingPlayer": string }
      console.log('Socket: newRound');
      console.log(data);
    })

    this.socketService.bind('endGame', (data: any) => {
      //TODO handle endGame, data contains { "finalScore": number[] }
      console.log('Socket: endGame');
      console.log(data);
    })
  }
}
