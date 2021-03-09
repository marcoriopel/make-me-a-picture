import { Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DrawingService } from '@app/services/drawing/drawing.service';
import {MatDialog} from '@angular/material/dialog';
import { ViewingComponent } from '../viewing/viewing.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Difficulty, Drawing } from '@app/classes/drawing';
import { environment } from 'src/environments/environment';

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

  constructor(private http: HttpClient, private fb: FormBuilder, public drawingService: DrawingService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.imageCreationForm = this.fb.group({
      drawingName:['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(30),
        Validators.pattern(/^\S*$/),
      ]],
      difficulty:['', Validators.required],
    })
    this.hintForm = this.fb.group({
      hint:['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(30),
        Validators.pattern(/^\S*$/),
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
      },
      err => {
        alert("Oups, un problème est survenu");
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
      case 'Facile': return Difficulty.easy;
      case 'Normale': return Difficulty.normal;
      case 'Difficile': return Difficulty.hard;
    }
    return Difficulty.easy // Default
  }

  sendDrawing(drawing: Drawing) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem('token')!});
    const options = { headers: headers, responseType: 'text' as 'json'};
    return this.http.post<any>(this.imageFormUrl, drawing, options);
  }
}
