import { Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DrawingService } from '@app/services/drawing/drawing.service';
import {MatDialog} from '@angular/material/dialog';
import { ViewingComponent } from '../viewing/viewing.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Drawing } from '@app/classes/drawing';
import { environment } from 'src/environments/environment';
import { Difficulty } from '@app/classes/game';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-image-creation',
  templateUrl: './image-creation.component.html',
  styleUrls: ['./image-creation.component.scss']
})
export class ImageCreationComponent implements OnInit {
  imageCreationForm: FormGroup;
  hintForm: FormGroup;
  difficulty = ['Facile', 'Normale', 'Difficile'];
  hint: string = '';
  hints: string[] = [];
  isHintListValid: boolean = false;
  baseUrl = environment.api_url;
  imageFormUrl = this.baseUrl + "/api/drawings/create"

  errorMessages: { [key: string]: string } = {
    text: "Entre 1 et 30 caractères",
  };

  constructor(private http: HttpClient, private fb: FormBuilder, public drawingService: DrawingService, public dialog: MatDialog, private snackBar: MatSnackBar) {
    this.drawingService.strokeStack = [];
    this.drawingService.redoStack = []
  }  

  ngOnInit(): void {
    this.imageCreationForm = this.fb.group({
      drawingName:['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(30),
        Validators.pattern(/.*[^ ].*/),
      ]],
      difficulty:['', Validators.required],
    })
    this.hintForm = this.fb.group({
      hint:['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(30),
        Validators.pattern(/.*[^ ].*/),
      ]],
    })
  }

  async processForm() {
    const drawing: Drawing = {
      drawingName: this.imageCreationForm.value.drawingName,
      difficulty: this.convertDifficulty(this.imageCreationForm.value.difficulty),
      strokes: this.drawingService.strokeStack,
      hints: this.hints,
    }
    this.sendDrawing(drawing).subscribe(
      res => {
        this.snackBar.open("L'image a été enregistrée avec succès", "", {
          duration: 2000,
        });
        this.drawingService.strokeStack = [];
        this.drawingService.redoStack = []
        this.drawingService.clearCanvas(this.drawingService.baseCtx);
        this.hintForm.reset();
        this.imageCreationForm.reset();
        this.hints = [];
      },
      err => {
        this.snackBar.open("Un problème est survenu. Impossible d'enregistrer l'image.", "", {
          duration: 2000,
        });
      }
    )
  }

  addHint(): void {
    if(this.hints.includes(this.hintForm.value.hint)) {
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

  openPreview(): void {
    const drawing: Drawing = {
      drawingName: this.imageCreationForm.value.drawingName,
      difficulty: this.convertDifficulty(this.imageCreationForm.value.difficulty),
      strokes: this.drawingService.strokeStack,
      hints: this.hints,
    }
    
    let dialogRef = this.dialog.open(ViewingComponent, {
      height: '800px',
      width: '1200px',
      data: drawing,
    });

    dialogRef.afterClosed(); // To avoid compiling error
  }

  convertDifficulty(difficulty: string): number {
    switch(difficulty) {
      case 'Facile': return Difficulty.EASY;
      case 'Normale': return Difficulty.MEDIUM;
      case 'Difficile': return Difficulty.HARD;
    }
    return Difficulty.EASY // Default
  }

  sendDrawing(drawing: Drawing) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem('token')!});
    const options = { headers: headers, responseType: 'text' as 'json'};
    return this.http.post<any>(this.imageFormUrl, drawing, options);
  }
}
