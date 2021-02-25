  import { Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Component({
  selector: 'app-image-creation',
  templateUrl: './image-creation.component.html',
  styleUrls: ['./image-creation.component.scss']
})
export class ImageCreationComponent implements OnInit {
  // @ViewChild('tipInput', { static: false }) tipInputRef: ElementRef<HTMLInputElement>;

  imageCreationForm: FormGroup;
  tipsForm: FormGroup;
  levels = ['Facile', 'Moyen', 'Difficile'];
  tip: string = '';
  tips: string[] = [];
  isTipListValid: boolean = false;

  errorMessages: { [key: string]: string } = {
    text: "Entre 1 et 30 caractères",
};

  constructor(private fb: FormBuilder, public drawingService: DrawingService) { }

  ngOnInit(): void {
    this.imageCreationForm = this.fb.group({
      word:['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(30),
      ]],
      level:['', Validators.required],
    })
    this.tipsForm = this.fb.group({
      tip:['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(30),
      ]],
    })
  }

  sendForm(): void {
    const newImage = {
      word: this.imageCreationForm.value.word,
      level: this.imageCreationForm.value.level,
      strokeStack: this.drawingService.strokeStack,
      tips: this.tips,
    }
    console.log(newImage);
  }

  addTip(): void {
    this.tips.push(this.tipsForm.value.tip);
    this.isTipListValid = this.tips.length > 0 ? true : false;
    this.tipsForm.reset();
  }

  deleteTip(index: number): void {
    this.tips.splice(index, 1);
    this.isTipListValid = this.tips.length > 0 ? true : false;
  }

}
