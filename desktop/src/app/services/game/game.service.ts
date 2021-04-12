import { Injectable} from '@angular/core';
import { Router } from '@angular/router';
import { BLACK, INITIAL_LINE_WIDTH, State } from '@app/ressources/global-variables/global-variables';
import { DrawingService } from '../drawing/drawing.service';
import { SocketService } from '../socket/socket.service';
import { MatDialog } from '@angular/material/dialog';
import { RoundTransitionComponent } from "@app/components/round-transition/round-transition.component";
import { GameType } from '@app/classes/game';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DrawingSuggestionsComponent } from '@app/components/drawing-suggestions/drawing-suggestions.component';
import * as confetti from 'canvas-confetti';

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
  transitionDialogRef: any;
  suggestionDialogRef: any;

  // Audio
  tick = new Audio('./assets/sounds/tick.wav');
  win = new Audio('./assets/sounds/win.wav');
  defeat = new Audio('./assets/sounds/defeat.wav');
  countdown = new Audio('./assets/sounds/countdown.wav');


  // Shared between different game types
  isCorrectGuess: boolean = false;
  isInGame: boolean = false;
  score: number[] = [0, 0];
  username: string | null;
  guessesLeft: number = 1;
  timer: number = 60;
  state: State = State.GAMESTART;
  gameId: string = '';

  // Classic game
  isUserTeamGuessing: boolean = false;
  isSuggestionsModalOpen: boolean = false;
  isPlayerDrawing: boolean = false;
  drawingSuggestions: string[];
  transitionTimer: number = 5;
  guessingPlayer: string = "";
  isGuessing: boolean = false;
  drawingName: string = "";
  currentUserTeam: number;
  drawingPlayer: string;
  teams: Teams;

  // Sprint coop and solo
  gameTimer: number = 180;


  constructor(private socketService: SocketService, private router: Router, private drawingService: DrawingService, public dialog: MatDialog, private snackBar: MatSnackBar) {
    this.username = localStorage.getItem('username');
  }

  initialize(gameType: GameType): void {
    switch (gameType) {
      case GameType.Classic:
        this.initializeClassic();
        break
      case GameType.SprintCoop:
        this.initializeSprint();
        break
      case GameType.SprintSolo:
        this.initializeSprint();
        break
    }
  }

  openDialog(state: State) {
    this.transitionDialogRef = this.dialog.open(RoundTransitionComponent, {
      data: {
        state: state,
      },
      disableClose: true,
      height: '400px',
      width: "600px"
    })
  }


  initializeClassic(): void {
    this.socketService.bind('gameStart', (data: any) => {
      this.isInGame = true;
      this.drawingPlayer = data.player;

      if(this.drawingPlayer == this.username){
        this.isPlayerDrawing = true;
      }

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
      this.router.navigate(['/game/classic']);
    })

    this.socketService.bind('eraserStrokes', (data: any) => {
      this.drawingService.strokes = Array.from(data.eraserStrokes);
    })

    this.socketService.bind('score', (data: any) => {
      this.score = data.score;
    })

    this.socketService.bind('drawingName', (data: any) => {
      this.drawingName = data.drawingName;
    })

    this.socketService.bind('guessesLeft', (data: any) => {
      if (this.username) {
        if (data.guessesLeft[this.currentUserTeam] == 1) {
          this.isUserTeamGuessing = true;
        } else {
          this.isPlayerDrawing = false;
          this.isUserTeamGuessing = false;
        }
      }
      this.tick.pause();
      this.updateGuessingStatus();
    })

    this.socketService.bind('guessCallback', (data: any) => {
      this.guessingPlayer = data.guessingPlayer;
      this.isCorrectGuess = data.isCorrectGuess;
    })

    this.socketService.bind('newRound', (data: any) => {
      this.drawingPlayer = data.newDrawingPlayer;
      this.drawingPlayer == this.username ? this.isPlayerDrawing = true : this.isPlayerDrawing = false;
      this.drawingService.clearCanvas(this.drawingService.baseCtx);
      this.drawingService.clearCanvas(this.drawingService.previewCtx);
      this.drawingService.strokeStack = [];
      this.drawingService.redoStack = [];
      this.drawingService.strokes = [];
      this.drawingService.lineWidth = INITIAL_LINE_WIDTH;
      this.drawingService.color = BLACK;
      this.updateGuessingStatus();
    })

    this.socketService.bind('endGame', (data: any) => {
      this.openDialog(State.ENDGAME);
      this.socketService.unbind('drawingTimer');
      this.socketService.unbind('gameTimer');
      this.socketService.unbind('newRound');
      this.socketService.unbind('guessCallBack');
      this.socketService.unbind('guessesLeft');
      this.socketService.unbind('score');
      let oppositeTeam;
      this.currentUserTeam == 0 ? oppositeTeam = 1 : oppositeTeam = 0;

      if(this.score[this.currentUserTeam] > this.score[oppositeTeam]){
        let canvasEl = document.getElementById('confettiCanvas') as HTMLCanvasElement;
        var myConfetti = confetti.create(canvasEl, { 
          resize: true, 
          useWorker: true, 
        });
    
        myConfetti({
          spread: 180,
          particleCount: 200,
        });         
      }
      this.score[this.currentUserTeam] > this.score[oppositeTeam] ? this.win.play() : this.defeat.play();
    })

    this.socketService.bind('timer', (data: any) => {
      this.timer = data.timer;
      if(data.timer == 10){
        this.tick.play();
      }
      if(data.timer == 0){
        this.tick.pause();
      }
    })
  
    this.socketService.bind('transitionTimer', (data: any) => {
      this.state = data.state;
      if(data.timer == 5){
        this.openDialog(this.state);
      }
      if(!data.timer){
        this.transitionDialogRef.close();
      }
      if(data.timer == 3){
        this.countdown.play();
      }
      this.transitionTimer = data.timer;
    })

    this.socketService.bind('drawingSuggestions', (data: any) => {
      this.drawingSuggestions = data.drawingNames;
      console.log(this.isSuggestionsModalOpen)
      if(!this.isSuggestionsModalOpen){
        this.suggestionDialogRef = this.dialog.open(DrawingSuggestionsComponent, {
          disableClose: true,
          height: '400px',
          width: "600px"
        })
        this.isSuggestionsModalOpen = true;
        this.suggestionDialogRef.afterClosed().subscribe((result:any) => {
          this.isSuggestionsModalOpen = false;
        });
      }
    })
  }

  initializeSprint(): void {
    this.socketService.bind('gameStart', (data: any) => {
      this.isInGame = true;
      this.drawingPlayer = data.player;
      this.router.navigate(['/game/sprint']);
    });

    this.socketService.bind('eraserStrokes', (data: any) => {
      this.drawingService.strokes = Array.from(data.eraserStrokes);
    })

    this.socketService.bind('score', (data: any) => {
      this.score[0] = data.score;
    })

    this.socketService.bind('guessesLeft', (data: any) => {
      this.guessesLeft = data.guessesLeft;
    })

    this.socketService.bind('guessCallback', (data: any) => {
      let message: string = "";
      data.isCorrectGuess ? message = "Bonne réponse" : message = "Mauvaise réponse";
      this.snackBar.open(message, "", {
        duration: 2000,
      });
    })

    this.socketService.bind('newRound', (data: any) => {
      this.drawingService.clearCanvas(this.drawingService.baseCtx);
      this.drawingService.clearCanvas(this.drawingService.previewCtx);
      this.drawingService.strokeStack = [];
      this.drawingService.redoStack = [];
      this.drawingService.strokes = [];
      this.drawingService.lineWidth = INITIAL_LINE_WIDTH;
      this.drawingService.color = BLACK;
    })

    this.socketService.bind('gameTimer', (data: any) => {
      this.gameTimer = data.timer;
      if(data.timer == 10){
        this.tick.play();
      }
      if(data.timer == 0){
        this.tick.pause();
      }
    })

    this.socketService.bind('drawingTimer', (data: any) => {
      this.timer = data.timer;
      if(data.timer == 10){
        this.tick.play();
      }
      if(data.timer == 0){
        this.tick.pause();
      }
    })

    this.socketService.bind('endGame', (data: any) => {
      this.openDialog(State.ENDGAME);
      this.socketService.unbind('drawingTimer');
      this.socketService.unbind('gameTimer');
      this.socketService.unbind('newRound');
      this.socketService.unbind('guessCallBack');
      this.socketService.unbind('guessesLeft');
      this.socketService.unbind('score');
    })
  }

  updateGuessingStatus() : void {
      if(this.isUserTeamGuessing && !this.isPlayerDrawing){
        this.isGuessing = true;
      } else {
        this.isGuessing = false;
      }
  }
}
