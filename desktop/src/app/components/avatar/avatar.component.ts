import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnInit {

  @ViewChild('dataContainer') dataContainer: ElementRef;
  svg = "SVG CONTENT";

  constructor() { }

  ngOnInit(): void {
    
    this.dataContainer.nativeElement.innerHTML = this.svg;
  }

}
