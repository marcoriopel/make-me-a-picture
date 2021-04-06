import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MINIMUM_CANVAS_HEIGHT, MINIMUM_CANVAS_WIDTH } from '@app/ressources/global-variables/global-variables';
import { Drawing } from '@app/classes/drawing';
import { Vec2 } from '@app/classes/vec2';
import { Difficulty, GuessTime } from '@app/classes/game';
@Component({
  selector: 'app-viewing',
  templateUrl: './viewing.component.html',
  styleUrls: ['./viewing.component.scss']
})
export class ViewingComponent implements AfterViewInit {
  @ViewChild('baseCanvas', { static: false }) baseCanvas: ElementRef<HTMLCanvasElement>;

  private baseCtx: CanvasRenderingContext2D;
  public isPlayButtonAvailable = true;
  private drawingSpeed: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) public drawing: Drawing,
  ) {   }

  ngAfterViewInit(): void {
    this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
  }

  async simulateDrawing() {
    this.isPlayButtonAvailable = false;
    this.baseCtx.clearRect(0, 0, MINIMUM_CANVAS_WIDTH, MINIMUM_CANVAS_HEIGHT)

    this.baseCtx.lineJoin = 'round';
    this.baseCtx.lineCap = 'round';

    this.drawingSpeed = this.calculateDrawingSpeed();

    for(let i = 0; i < this.drawing.strokes.length; i++){
      this.baseCtx.lineWidth = this.drawing.strokes[i].lineWidth;
      this.baseCtx.strokeStyle = this.drawing.strokes[i].lineColor;
      await this.drawStroke(this.drawing.strokes[i].path);
    }
    this.isPlayButtonAvailable = true;
  }

  async drawStroke(path: Vec2[]) {
    for(let i = 0; i < path.length - 1; i++){
      this.baseCtx.beginPath();
      this.baseCtx.lineTo(path[i].x, path[i].y);
      this.baseCtx.lineTo(path[i + 1].x, path[i + 1].y);
      this.baseCtx.stroke();
      await this.delay();
    }
  }

  delay = () => new Promise(res => setTimeout(res, this.drawingSpeed))


  private calculateDrawingSpeed(): number {
    let drawingSpeed = 0;
    let pointsNumber: number = this.calculatePointsInDrawing();
    switch(this.drawing.difficulty){
        case Difficulty.EASY:
            drawingSpeed = 20 / pointsNumber;
            break;
        case Difficulty.EASY:
            drawingSpeed = 20 / pointsNumber;
            break;
        case Difficulty.EASY:
            drawingSpeed = 20 / pointsNumber;
            break;
    }
    return drawingSpeed;
  }  

  private calculatePointsInDrawing(): number {
      let pointsNumber = 0;
      for(let stroke of this.drawing.strokes){
          for(let {} of stroke.path){
              ++pointsNumber;
          }
      }
      return pointsNumber;
  } 
}
