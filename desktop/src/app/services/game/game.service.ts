import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BLACK, INITIAL_LINE_WIDTH, State } from '@app/ressources/global-variables/global-variables';
import { DrawingService } from '../drawing/drawing.service';
import { SocketService } from '../socket/socket.service';
import { MatDialog } from '@angular/material/dialog';
import { RoundTransitionComponent } from "@app/components/round-transition/round-transition.component";
import { GameType } from '@app/classes/game';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DrawingSuggestionsComponent } from '@app/components/drawing-suggestions/drawing-suggestions.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ACCESS } from '@app/classes/acces';
import { EndGameDrawingComponent } from '@app/components/end-game-drawing/end-game-drawing.component';
import { Stroke } from '@app/classes/drawing';
import { BrowserWindow } from 'electron';
import { ElectronService } from 'ngx-electron';

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
  endGameDialogRef: any;
  chatWindow: BrowserWindow;


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
  virtualPlayerDrawings: any[] = [];
  realPlayerDrawings: any[] = [];
  virtualPlayers: string[] = [];
  isGuessAvailable: boolean = true;
  isUserTeamGuessing: boolean = false;
  isSuggestionsModalOpen: boolean = false;
  isPlayerDrawing: boolean = false;
  numberOfDrawings: number = 0;
  drawingSuggestions: string[];
  transitionTimer: number = 5;
  guessingPlayer: string = "";
  drawings: string[] = [];
  isGuessing: boolean = false;
  drawingName: string = "";
  currentUserTeam: number;
  drawingPlayer: string;
  teams: Teams;

  // Sprint coop and solo
  gameTimer: number = 120;
  isMaxScoreEnding: boolean = false;


  constructor(private electronService: ElectronService, private socketService: SocketService, private router: Router, private drawingService: DrawingService, public dialog: MatDialog, private snackBar: MatSnackBar, private http: HttpClient) {
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
      if(this.electronService.process){
        try {
          this.chatWindow.closable = false;
        } catch {

        }
      }
      this.drawingPlayer = data.player;

      if (this.drawingPlayer == this.username) {
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
        if (player.isVirtual) {
          this.virtualPlayers.push(player.username);
        }
      });
      this.router.navigate(['/game/classic']);
    })

    this.socketService.bind('eraserStrokes', (data: any) => {
      this.drawingService.strokes = Array.from(data.eraserStrokes);
    })

    this.socketService.bind('hintError', (data: any) => {
      this.snackBar.open("Il ne reste plus d'indices", "", {
        duration: 2000,
      });
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


    this.socketService.bind('userDisconnect', (data: any) => {
      this.snackBar.open("Un joueur s'est déconnecté, nous devons terminer la partie =(", "", {
        duration: 4000,
      });
    })

    this.socketService.bind('newRound', (data: any) => {
      this.tick.pause();
      this.drawingService.opacity = 1;
      this.drawingService.isGridEnabled = false;
      if (this.drawingPlayer == this.username) {
        let dataUrl = this.drawingService.canvas.toDataURL();

        let eraserStrokes: Stroke[] = this.drawingService.strokeStack.filter(stroke => stroke.isEraser);
        let pencilStrokes: Stroke[] = this.drawingService.strokeStack.filter(stroke => !stroke.isEraser);
        const strokes = {
          eraserStrokes: eraserStrokes,
          pencilStrokes: pencilStrokes,
        }

        const drawing = {
          url: dataUrl,
          drawingName: this.drawingName,
          strokes: strokes,
        }

        this.realPlayerDrawings.push(drawing);

        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'authorization': localStorage.getItem(ACCESS.TOKEN)!
        });
        const options = { headers: headers, responseType: 'text' as 'json' };
        const body = { imageUrl: dataUrl, gameId: this.gameId }
        this.http.post<any>(environment.socket_url + 'api/games/upload', body, options).subscribe(
          (res: any) => {
            console.log(res);
          },
          (err: any) => {
            console.log(err);
          }
        );
      }
      this.drawingPlayer = data.newDrawingPlayer;
      if(this.drawingPlayer == this.username){
        this.isPlayerDrawing = true;
        this.numberOfDrawings++;
      } else {
        this.isPlayerDrawing = false;
      }
      this.drawingService.clearCanvas(this.drawingService.baseCtx);
      this.drawingService.clearCanvas(this.drawingService.previewCtx);
      this.drawingService.strokeStack = [];
      this.drawingService.redoStack = [];
      this.drawingService.strokes = [];
      this.drawingService.strokeNumber = 0;
      this.drawingService.lineWidth = INITIAL_LINE_WIDTH;
      this.drawingService.color = BLACK;
      this.updateGuessingStatus();
    })

    this.socketService.bind('endGame', (data: any) => {
      this.socketService.unbind('endGame');
      this.tick.pause();
      this.countdown.pause();
      if (this.drawingPlayer == this.username) {
        let dataUrl = this.drawingService.canvas.toDataURL();

        let eraserStrokes: Stroke[] = this.drawingService.strokeStack.filter(stroke => stroke.isEraser);
        let pencilStrokes: Stroke[] = this.drawingService.strokeStack.filter(stroke => !stroke.isEraser);
        const strokes = {
          eraserStrokes: eraserStrokes,
          pencilStrokes: pencilStrokes,
        }

        const drawing = {
          url: dataUrl,
          drawingName: this.drawingName,
          strokes: strokes,
        }

        this.realPlayerDrawings.push(drawing);

        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'authorization': localStorage.getItem(ACCESS.TOKEN)!
        });
        const options = { headers: headers, responseType: 'text' as 'json' };
        const body = { imageUrl: dataUrl, gameId: this.gameId }
        this.http.post<any>(environment.socket_url + 'api/games/upload', body, options).subscribe(
          (res: any) => {
            console.log(res);
          },
          (err: any) => {
            console.log(err);
          }
        );
      }
      for(let i = 0; i < data.virtualPlayerDrawings.length; i++){
        const vdrawing = {
          name: data.virtualPlayerDrawings[i],
          url: 'https://drawingimages.s3.us-east-2.amazonaws.com/' + data.virtualPlayerIds[i] + '.png',
          id: data.virtualPlayerIds[i],
        }
        this.virtualPlayerDrawings.push(vdrawing);
      }
      this.openEndGameModal();
      this.drawingService.strokeStack = [];
      this.drawingService.strokeNumber = 0;
      this.drawingService.redoStack = [];
      this.drawingService.strokeNumber = 0;
      this.drawingService.strokes = [];
      this.virtualPlayerDrawings = [];
      this.realPlayerDrawings = [];
      this.drawingPlayer = this.username as string;
      this.isInGame = false;
      if(this.electronService.process){
        try {
          this.chatWindow.closable = true;
        } catch {
          
        }
      }
      this.isGuessing = false;
      this.isUserTeamGuessing = false;
      this.socketService.unbind('hintError');
      this.socketService.unbind('drawingEvent');
      this.socketService.unbind('eraserStrokes');
      this.socketService.unbind('drawingTimer');
      this.socketService.unbind('transitionTimer');
      this.socketService.unbind('gameTimer');
      this.socketService.unbind('newRound');
      this.socketService.unbind('guessCallBack');
      this.socketService.unbind('guessesLeft');
      this.socketService.unbind('userDisconnect');
      this.socketService.unbind('score');
      let oppositeTeam;
      this.currentUserTeam == 0 ? oppositeTeam = 1 : oppositeTeam = 0;
      this.score[this.currentUserTeam] > this.score[oppositeTeam] ? this.win.play() : this.defeat.play();
      this.transitionDialogRef.close();
      this.suggestionDialogRef.close();
    })

    this.socketService.bind('timer', (data: any) => {
      this.timer = data.timer;
      if (data.timer == 10) {
        this.tick.play();
      }
      if (data.timer == 0) {
        this.tick.pause();
      }
    })

    this.socketService.bind('transitionTimer', (data: any) => {
      this.state = data.state;
      if (data.timer == 5) {
        this.openDialog(this.state);
      }
      if (!data.timer) {
        this.transitionDialogRef.close();
      }
      if (data.timer == 3) {
        this.countdown.play();
      }
      this.transitionTimer = data.timer;
    })

    this.socketService.bind('drawingSuggestions', (data: any) => {
      this.drawingSuggestions = data.drawingNames;
      if (!this.isSuggestionsModalOpen) {
        this.suggestionDialogRef = this.dialog.open(DrawingSuggestionsComponent, {
          disableClose: true,
          height: '400px',
          width: "600px"
        })
        this.isSuggestionsModalOpen = true;
        this.suggestionDialogRef.afterClosed().subscribe((result: any) => {
          this.isSuggestionsModalOpen = false;
        });
      }
    })
  }

  initializeSprint(): void {
    this.socketService.bind('gameStart', (data: any) => {
      this.isInGame = true;
      if(this.electronService.process){
        try {
          this.chatWindow.closable = false;
        } catch {

        }
      }
      this.drawingPlayer = data.player;
      this.router.navigate(['/game/sprint']);
      this.teams = {
        team1: data.teams,
        team2: [],
      }
    });

    this.socketService.bind('eraserStrokes', (data: any) => {
      this.drawingService.strokes = Array.from(data.eraserStrokes);
    })

    this.socketService.bind('userDisconnect', (data: any) => {
      this.snackBar.open("Un joueur s'est déconnecté, nous devons terminer la partie =(", "", {
        duration: 4000,
      });
    })

    this.socketService.bind('score', (data: any) => {
      this.score[0] = data.score;
    })

    this.socketService.bind('hintError', (data: any) => {
      this.snackBar.open("Il ne reste plus d'indices", "", {
        duration: 2000,
      });
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
      this.tick.pause();
      this.isGuessAvailable = true;
      this.drawingService.clearCanvas(this.drawingService.baseCtx);
      this.drawingService.strokeStack = [];
      this.drawingService.redoStack = [];
      this.drawingService.strokes = [];
      this.drawingService.strokeNumber = 0;
      this.drawingService.lineWidth = INITIAL_LINE_WIDTH;
      this.drawingService.color = BLACK;
      this.drawingService.opacity = 1;
      this.drawingService.isGridEnabled = false;
    })

    this.socketService.bind('gameTimer', (data: any) => {
      this.gameTimer = data.timer;
      if (data.timer == 10) {
        this.tick.play();
      }
      if (data.timer == 0) {
        this.tick.pause();
      }
    })

    this.socketService.bind('drawingTimer', (data: any) => {
      this.timer = data.timer;
      if (data.timer == 10) {
        this.tick.play();
      }
      if (data.timer == 0) {
        this.tick.pause();
      }
    })

    this.socketService.bind('transitionTimer', (data: any) => {
      this.state = data.state;
      if (data.timer == 5) {
        this.openDialog(State.SPRINTSTART);
      }
      if (!data.timer) {
        this.transitionDialogRef.close();
      }
      if (data.timer == 3) {
        this.countdown.play();
      }
      this.transitionTimer = data.timer;
    })

    this.socketService.bind('maxScore', (data: any) => {
      this.isMaxScoreEnding = true;
    });

    this.socketService.bind('endGame', (data: any) => {
      this.tick.pause();
      this.isGuessing = false;
      if(this.isMaxScoreEnding){
        this.openDialog(State.MAXSCORE);
      } else {
        this.openDialog(State.ENDGAME);
        this.isMaxScoreEnding = false;
      }
      this.drawingService.strokeStack = [];
      this.drawingService.strokeNumber = 0;
      this.drawingService.redoStack = [];
      this.drawingService.strokeNumber = 0;
      this.drawingService.strokes = [];
      if(this.electronService.process){
        try {
          this.chatWindow.closable = true;
        } catch {
          
        }
      }
      this.socketService.unbind('hintError');
      this.socketService.unbind('drawingEvent');
      this.socketService.unbind('eraserStrokes');
      this.socketService.unbind('drawingTimer');
      this.socketService.unbind('transitionTimer');
      this.socketService.unbind('gameTimer');
      this.socketService.unbind('newRound');
      this.socketService.unbind('guessCallBack');
      this.socketService.unbind('guessesLeft');
      this.socketService.unbind('score');
      this.socketService.unbind('userDisconnect');
    })
  }

  updateGuessingStatus(): void {
    if (this.isUserTeamGuessing && !this.isPlayerDrawing) {
      this.isGuessing = true;
    } else {
      this.isGuessing = false;
    }
  }

  openEndGameModal(): void {
    this.endGameDialogRef = this.dialog.open(EndGameDrawingComponent, {
      disableClose: true,
      height: '800px',
      width: "1200px"
    })
  }
}
