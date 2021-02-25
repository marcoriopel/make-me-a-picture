import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-image-creation',
  templateUrl: './image-creation.component.html',
  styleUrls: ['./image-creation.component.scss']
})
export class ImageCreationComponent implements OnInit {

  imageCreationForm: FormGroup;
  levels = ['Facile', 'Moyen', 'Difficile'];
  constructor() { }

  ngOnInit(): void {
  }

}
