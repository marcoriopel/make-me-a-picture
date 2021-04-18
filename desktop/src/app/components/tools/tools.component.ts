import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BLACK, POLY_RED, WHITE } from '@app/ressources/global-variables/global-variables';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilService } from '@app/services/tools/pencil.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.scss']
})
export class ToolsComponent implements OnInit {
  @ViewChild('pencil', { static: false }) pencilRef: ElementRef<HTMLButtonElement>;
  @ViewChild('eraser', { static: false }) eraserRef: ElementRef<HTMLButtonElement>;
  
  constructor(private drawingService: DrawingService, public undoRedoService: UndoRedoService, public pencilService: PencilService) {
    this.drawingService.color = BLACK;
  }

  pencilColor: string = BLACK;

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
        try {
            this.pencilRef.nativeElement.style.backgroundColor = POLY_RED;
        } catch(e) {
            return;
        }
    });
  }

  setEraser(): void {
    this.drawingService.currentTool = 'eraser';
    this.drawingService.lineWidth = this.drawingService.eraserWidth;
    this.pencilColor = this.drawingService.color;
    this.pencilService.isCurrentToolEraser = true;
    this.drawingService.color = WHITE;
    this.pencilRef.nativeElement.style.backgroundColor = WHITE;
    this.eraserRef.nativeElement.style.backgroundColor = POLY_RED;
  }

  resetPencil(){
    this.drawingService.color = this.pencilColor;
    this.setPencil();
  }

  setPencil(): void {
    this.drawingService.currentTool = 'pencil';
    this.drawingService.lineWidth = this.drawingService.pencilWidth;
    this.pencilService.isCurrentToolEraser = false;
    this.pencilRef.nativeElement.style.backgroundColor = POLY_RED;
    this.eraserRef.nativeElement.style.backgroundColor = WHITE;
  }

}
