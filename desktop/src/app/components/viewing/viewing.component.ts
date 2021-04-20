import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MINIMUM_CANVAS_HEIGHT, MINIMUM_CANVAS_WIDTH } from '@app/ressources/global-variables/global-variables';
import { Drawing, Stroke } from '@app/classes/drawing';
import { Vec2 } from '@app/classes/vec2';
import { Difficulty } from '@app/classes/game';
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

    let strokes: Stroke[] = Array.from(this.drawing.eraserStrokes);

    for(let i = 0; i < this.drawing.pencilStrokes.length; i++){
      let stroke: Stroke = this.drawing.pencilStrokes[i];
      stroke = {
        lineColor: stroke.lineColor,
        lineOpacity: stroke.lineOpacity,
        lineWidth: stroke.lineWidth,
        strokeNumber: stroke.strokeNumber,
        path: [],
        isEraser: stroke.isEraser,
      }
      strokes.push(stroke);
      strokes.sort((stroke1, stroke2) => stroke1.strokeNumber - stroke2.strokeNumber )
      for(let point of this.drawing.pencilStrokes[i].path){
        stroke.path.push(point);
        this.drawStrokes(strokes);
        await this.delay();
      }
    }
    
    this.isPlayButtonAvailable = true;
  }

  drawStrokes(strokes: Stroke[]){
    for(let i = 0; i < strokes.length; i++){
      this.baseCtx.lineWidth = strokes[i].lineWidth;
      this.baseCtx.strokeStyle = strokes[i].lineColor;
      this.baseCtx.globalAlpha = strokes[i].lineOpacity;
      this.drawStroke(strokes[i].path);
    }
  }

  drawStroke(path: Vec2[]) {
    for(let i = 0; i < path.length - 1; i++){
      this.baseCtx.beginPath();
      this.baseCtx.lineTo(path[i].x, path[i].y);
      this.baseCtx.lineTo(path[i + 1].x, path[i + 1].y);
      this.baseCtx.stroke();
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
    for(let stroke of this.drawing.eraserStrokes){
        for(let {} of stroke.path){
            ++pointsNumber;
        }
    }
    for(let stroke of this.drawing.pencilStrokes){
      for(let {} of stroke.path){
          ++pointsNumber;
      }
    }
    return pointsNumber;
  } 
}