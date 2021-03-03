  import { Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DrawingService } from '@app/services/drawing/drawing.service';
import {MatDialog} from '@angular/material/dialog';
import { ViewingComponent } from '../viewing/viewing.component';
import { Difficulty, Drawing } from '@app/classes/drawing';

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

  errorMessages: { [key: string]: string } = {
    text: "Entre 1 et 30 caractères",
  };

  constructor(private fb: FormBuilder, public drawingService: DrawingService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.imageCreationForm = this.fb.group({
      drawingName:['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(30),
      ]],
      difficulty:['', Validators.required],
    })
    this.hintForm = this.fb.group({
      hint:['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(30),
      ]],
    })
  }

  sendForm(): void {
    const newImage: Drawing = {
      drawingName: this.imageCreationForm.value.drawingName,
      difficulty: this.convertDifficulty(this.imageCreationForm.value.difficulty),
      strokes: this.drawingService.strokeStack,
      hints: this.hints,
    }
    console.log(newImage);
  }

  addHint(): void {
    this.hints.push(this.hintForm.value.hint);
    this.isHintListValid = this.hints.length > 0 ? true : false;
    this.hintForm.reset();
  }

  deleteHint(index: number): void {
    this.hints.splice(index, 1);
    this.isHintListValid = this.hints.length > 0 ? true : false;
  }

  openPreview(): void {
    const data: Drawing = {
      drawingName: this.imageCreationForm.value.drawingName,
      difficulty: this.convertDifficulty(this.imageCreationForm.value.difficulty),
      strokes: this.drawingService.strokeStack,
      hints: this.hints,
    }
    
    let dialogRef = this.dialog.open(ViewingComponent, {
      height: '800px',
      width: '1200px',
      data: data,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });

  }

  convertDifficulty(difficulty: string): number {
    console.log(difficulty)
    switch(difficulty) {
      case 'Facile': return Difficulty.Facile;
      case 'Normale': return Difficulty.Normale;
      case 'Difficile': return Difficulty.Difficile;
    }
    return Difficulty.Facile // Default
  }

}
