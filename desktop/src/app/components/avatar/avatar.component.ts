import { Component, Input} from '@angular/core';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent {

  @Input() backgroundColor : string;
  @Input() headColor : string;
  @Input() bodyColor : string;

  constructor() { 
    if(this.backgroundColor === undefined || this.headColor === undefined || this.bodyColor === undefined){
      this.randomize();
    }
  }

  randomize() : void{
    this.backgroundColor = this.generatedRandomColor();
    this.headColor = this.generatedRandomColor();
    this.bodyColor = this.generatedRandomColor();
  }

  generatedRandomColor(): string {
    const R : number = Math.floor(Math.random() * 255);
    const G : number = Math.floor(Math.random() * 255);
    const B : number = Math.floor(Math.random() * 255);
    return "rgb(" + R + "," + G + "," + B + ")";
  }
}
