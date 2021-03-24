import { Component, OnInit} from '@angular/core';
import { SocketService } from '@app/services/socket/socket.service';
import { DrawingEvent, drawingEventType, MouseDown, Vec2 } from '@app/classes/game';
import { PencilService } from '@app/services/tools/pencil.service';
import { MouseButton } from '@app/ressources/global-variables/global-variables';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { GameService } from '@app/services/game/game.service';
import { FormBuilder } from '@angular/forms';
import { OnDestroy } from "@angular/core";

@Component({
  selector: 'app-classic-game',
  templateUrl: './classic-game.component.html',
  styleUrls: ['./classic-game.component.scss']
})
export class ClassicGameComponent implements OnInit, OnDestroy {

  guessForm = this.formBuilder.group({
    guess: '',
  });

  constructor(private socketService: SocketService, public gameService: GameService, private pencilService: PencilService, private drawingService: DrawingService, private undoRedoService: UndoRedoService, private formBuilder: FormBuilder) { 
    console.log("GAME CONSTRUCTION")
  }

  ngOnInit(): void {
    this.socketService.bind('drawingEvent', (data: any) => {
      this.handleDrawingEvent(data.drawingEvent);
    });
  }

  ngOnDestroy(): void {
    this.socketService.emit('leaveGame', {'gameId': this.gameService.gameId})
    this.gameService.drawingPlayer = this.gameService.username as string;
    this.gameService.isInGame = false;
    this.gameService.isGuessing = false;
    this.gameService.isUserTeamGuessing = false;
    console.log("GAME DESTRUCTION")
  }

  handleDrawingEvent(data: DrawingEvent): void {
    if (this.gameService.drawingPlayer != localStorage.getItem('username')) {
      switch (data.eventType) {
        case drawingEventType.MOUSEDOWN:
          const mouseDown = data.event as MouseDown;
          this.drawingService.lineWidth = mouseDown.lineWidth;
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

  createMouseEvent(mousePosition: Vec2): MouseEvent {
    return {
      offsetX: mousePosition.x,
      offsetY: mousePosition.y,
      button: MouseButton.LEFT
    } as MouseEvent
  }

  onGuessSubmit(): void {
    const body = {
      "gameId": this.gameService.gameId,
      "guess": this.guessForm.value.guess,
    }
    this.socketService.emit("guessDrawing", body);
    this.guessForm.reset();
  }

  

}
