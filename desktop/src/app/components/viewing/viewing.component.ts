import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MINIMUM_CANVAS_HEIGHT, MINIMUM_CANVAS_WIDTH } from '@app/ressources/global-variables/global-variables';
import { Drawing } from '@app/classes/drawing';
import { Vec2 } from '@app/classes/vec2';
@Component({
  selector: 'app-viewing',
  templateUrl: './viewing.component.html',
  styleUrls: ['./viewing.component.scss']
})
export class ViewingComponent implements AfterViewInit {
  @ViewChild('baseCanvas', { static: false }) baseCanvas: ElementRef<HTMLCanvasElement>;

  private baseCtx: CanvasRenderingContext2D;
  public isPlayButtonAvailable = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public drawing: Drawing,
  ) {
    console.log(drawing);
   }

  ngAfterViewInit(): void {
    this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
  }

  async simulateDrawing() {
    this.isPlayButtonAvailable = false;
    this.baseCtx.clearRect(0, 0, MINIMUM_CANVAS_WIDTH, MINIMUM_CANVAS_HEIGHT)

    this.baseCtx.lineJoin = 'round';
    this.baseCtx.lineCap = 'round';

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
      await this.timer(this.drawing.difficulty);
    }
  }

  timer = (difficultyMultiplier: number) => new Promise(res => setTimeout(res, 50 * difficultyMultiplier))

}
