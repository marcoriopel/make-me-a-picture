import { Injectable} from '@angular/core';
import { Router } from '@angular/router';
import { BLACK, INITIAL_LINE_WIDTH } from '@app/ressources/global-variables/global-variables';
import { DrawingService } from '../drawing/drawing.service';
import { SocketService } from '../socket/socket.service';
import { MatDialog } from '@angular/material/dialog';
import { RoundTransitionComponent } from "@app/components/round-transition/round-transition.component";

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
  isUserTeamGuessing: boolean = false;
  currentUserTeam: number;
  timer: number = 69;
  transitionTimer: number = 5;
  dialogRef: any;

  isPlayerDrawing: boolean = false;
  isCorrectGuess: boolean = false;
  guessingPlayer: string = "";
  state: number = 0;

  constructor(private socketService: SocketService, private router: Router, private drawingService: DrawingService, public dialog: MatDialog) {
    this.username = localStorage.getItem('username');
  }

  openDialog(state: number) {
    this.dialogRef = this.dialog.open(RoundTransitionComponent, {
      data: {
        state: state,
      },
      disableClose: true,
      height: '400px',
      width: "600px"
    })


    this.dialogRef.afterClosed().subscribe((result:any) => {
      console.log(`Dialog result: ${result}`);
    });
  }


  initialize(): void {
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
      this.router.navigate(['/game']);
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
      this.updateGuessingStatus();
    })

    this.socketService.bind('guessCallback', (data: any) => {
      //TODO handle guessCallback, data contains { "isCorrectGuess": boolean, "guessingPlayer": string }
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
      this.drawingService.lineWidth = INITIAL_LINE_WIDTH;
      this.drawingService.color = BLACK;
      this.updateGuessingStatus();
    })

    this.socketService.bind('endGame', (data: any) => {
      //TODO handle endGame, data contains { "finalScore": number[] }
    })

    this.socketService.bind('timer', (data: any) => {
      this.timer = data.timer;
    })
  
    this.socketService.bind('transitionTimer', (data: any) => {
      this.state = data.state;
      if(data.timer == 5){
        this.openDialog(this.state);
      }
      if(!data.timer){
        this.dialogRef.close();
      }
      this.transitionTimer = data.timer;
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
