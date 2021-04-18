import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ACCESS } from '@app/classes/acces';
import { GameService } from '@app/services/game/game.service';
import * as confetti from 'canvas-confetti';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Difficulty } from '@app/classes/game';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-end-game-drawing',
  templateUrl: './end-game-drawing.component.html',
  styleUrls: ['./end-game-drawing.component.scss'],
  host: {
    '[style.display]': '"flex"',
    '[style.flex-direction]': '"column"',
    '[style.overflow]': '"hidden"'
  }
})
export class EndGameDrawingComponent implements OnInit {
  private baseUrl = environment.api_url;
  private voteUrl = this.baseUrl + '/api/drawings/vote'
  private imageFormUrl = this.baseUrl + "/api/drawings/create"

  isFormAvailable = false;
  isUploadButtonAvailable = true;
  imageCreationForm: FormGroup;
  hintForm: FormGroup;
  difficulty = ['Facile', 'Normale', 'Difficile'];
  hint: string = '';
  hints: string[] = [];
  isHintListValid: boolean = false;

  errorMessages: { [key: string]: string } = {
    text: "Entre 1 et 30 caractères",
  };

  virtualPlayerDrawings: any[] = [];
  realPlayerDrawings: any[] = [];

  result: string = "";
  winningTeam: any;
  loosingTeam: any;
  drawTeam1: any;
  drawTeam2: any;

  constructor(private gameService: GameService, private http: HttpClient, private snackBar: MatSnackBar, private router: Router, private fb: FormBuilder) {
    this.gameService.virtualPlayerDrawings.forEach((drawing: any) => {
      this.virtualPlayerDrawings.push(drawing);
    });

    this.gameService.realPlayerDrawings.forEach((drawing: any) => {
      this.realPlayerDrawings.push(drawing);
    });
   }

  ngOnInit(): void {
    this.imageCreationForm = this.fb.group({
      difficulty: ['', Validators.required],
    })
    this.hintForm = this.fb.group({
      hint: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(30),
        Validators.pattern(/.*[^ ].*/),
      ]],
    })

    if(this.gameService.score[0] > this.gameService.score[1]){
      // Team 1 win
      if(this.gameService.teams.team1.includes(this.gameService.username as string)){
        this.result = 'Victoire';
        let canvasEl = document.getElementById('confetti-canvas') as HTMLCanvasElement;
        var myConfetti = confetti.create(canvasEl, { 
          resize: true, 
        });
    
        myConfetti({
          spread: 180,
          particleCount: 200,
        });  
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

    } else if(this.gameService.score[1] > this.gameService.score[0]){
      if(this.gameService.teams.team1.includes(this.gameService.username as string)){
        this.result = 'Défaite';
      } else {
        this.result = 'Victoire';
        let canvasEl = document.getElementById('confetti-canvas') as HTMLCanvasElement;
        var myConfetti = confetti.create(canvasEl, { 
          resize: true, 
        });
    
        myConfetti({
          spread: 180,
          particleCount: 200,
        });           

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

  processForm(): void {
    const drawing: any = {
      eraserStrokes: this.realPlayerDrawings[0].strokes.eraserStrokes,
      pencilStrokes: this.realPlayerDrawings[0].strokes.pencilStrokes,
      drawingName: this.realPlayerDrawings[0].drawingName,
      hints: this.hints,
      difficulty: this.convertDifficulty(this.imageCreationForm.value.difficulty),
      imageUrl: this.realPlayerDrawings[0].url,
    }
    this.sendDrawing(drawing).subscribe(
      res => {
        this.snackBar.open("L'image a été enregistrée avec succès", "", {
          duration: 2000,
        });
      },
      err => {
        this.snackBar.open("Un problème est survenu. Impossible d'enregistrer l'image.", "", {
          duration: 2000,
        });
      }
    );
  }

  convertDifficulty(difficulty: string): number {
    switch (difficulty) {
      case 'Facile': return Difficulty.EASY;
      case 'Normale': return Difficulty.MEDIUM;
      case 'Difficile': return Difficulty.HARD;
    }
    return Difficulty.EASY // Default
  }

  addHint(): void {
    if (this.hints.includes(this.hintForm.value.hint)) {
      alert('Vous avez déjà ajouté cet indice');
      return;
    }
    this.hints.push(this.hintForm.value.hint);
    this.isHintListValid = this.hints.length > 0 ? true : false;
    this.hintForm.reset();
  }

  deleteHint(index: number): void {
    this.hints.splice(index, 1);
    this.isHintListValid = this.hints.length > 0 ? true : false;
  }

  sendDrawing(drawing: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem('token')!
    });
    const options = { headers: headers, responseType: 'text' as 'json' };
    return this.http.post<any>(this.imageFormUrl, drawing, options);
  }

  showForm(): void {
    this.isFormAvailable = true;
    this.isUploadButtonAvailable = false;
  }

  quit(): void {
    this.router.navigate(['/home']);
  }

}
