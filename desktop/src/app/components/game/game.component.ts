import { Component, OnInit } from '@angular/core';
import { SocketService } from '@app/services/socket/socket.service';
import { DrawingEvent, drawingEventType, MouseDown, Vec2 } from '@app/classes/game';
import { PencilService } from '@app/services/tools/pencil.service';
import { MouseButton } from '@app/ressources/global-variables/global-variables';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { GameService } from '@app/services/game/game.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  constructor(private socketService: SocketService, private gameService: GameService, private pencilService: PencilService, private drawingService: DrawingService, private undoRedoService: UndoRedoService) { }

  ngOnInit(): void {
    this.socketService.bind('drawingEvent', (data: any) =>{
      console.log('receive');
      this.handleDrawingEvent(data.drawingEvent);
    });
  }

  handleDrawingEvent(data: DrawingEvent): void {
    if(this.gameService.drawingPlayer != localStorage.getItem('username')){
      switch(data.eventType){
        case drawingEventType.MOUSEDOWN:
          const mouseDown = data.event as MouseDown;          
          this.pencilService.changeWidth(mouseDown.lineWidth);
          this.drawingService.color = mouseDown.lineColor;
          this.pencilService.onMouseDown(this.createMouseEvent(mouseDown.coords));
          break;          

        case drawingEventType.MOUSEUP:
          const mouseUp = data.event as Vec2;          
          this.pencilService.onMouseUp(this.createMouseEvent(mouseUp));
          break;

        case drawingEventType.MOUSEMOVE:
          const mouseMove = data.event as Vec2;          
          this.pencilService.onMouseMove(this.createMouseEvent(mouseMove));
          break;

        case drawingEventType.UNDO:
          this.undoRedoService.undo();
          break;
        
        case drawingEventType.REDO:
          this.undoRedoService.redo();
          break;    

        default:
          console.error('oups');
      }      
    }

  }

  createMouseEvent(mousePosition : Vec2): MouseEvent{
    return {
      offsetX: mousePosition.x,
      offsetY: mousePosition.y,
      button: MouseButton.LEFT
    } as MouseEvent
  }

}
