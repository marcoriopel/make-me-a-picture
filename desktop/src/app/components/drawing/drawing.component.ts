import { AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GameService } from '@app/services/game/game.service';
import { PencilService } from '@app/services/tools/pencil.service';

@Component({
    selector: 'app-drawing',
    templateUrl: './drawing.component.html',
    styleUrls: ['./drawing.component.scss'],
})
export class DrawingComponent implements AfterViewInit {
    @ViewChild('baseCanvas', { static: false }) baseCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('previewCanvas', { static: false }) previewCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridCanvas', { static: false }) gridCanvas: ElementRef<HTMLCanvasElement>;

    @Input() canvasSize: Vec2;
    @Input() previewSize: Vec2;
    @Input() isInGame: boolean;

    private baseCtx: CanvasRenderingContext2D;
    private previewCtx: CanvasRenderingContext2D;
    private gridCtx: CanvasRenderingContext2D;

    constructor(
        private drawingService: DrawingService,
        private pencilService: PencilService,
        private gameService: GameService,
    ) {}

    ngAfterViewInit(): void {
        this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.previewCtx = this.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gridCtx = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingService.baseCtx = this.baseCtx;
        this.drawingService.gridCtx = this.gridCtx;
        this.drawingService.previewCtx = this.previewCtx;
        this.drawingService.canvas = this.baseCanvas.nativeElement;
        this.drawingService.previewCanvas = this.previewCanvas.nativeElement;
        this.drawingService.gridCanvas = this.gridCanvas.nativeElement;
    }

    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        if(this.gameService.drawingPlayer != localStorage.getItem('username') && this.isInGame) return;
        this.pencilService.onMouseMove(event);
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        if(this.gameService.drawingPlayer != localStorage.getItem('username') && this.isInGame) return;
        this.pencilService.onMouseDown(event);
    }

    @HostListener('mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        if(this.gameService.drawingPlayer != localStorage.getItem('username') && this.isInGame) return;
        this.pencilService.onMouseUp(event);
    }

    @HostListener('mouseleave', ['$event'])
    onMouseLeave(): void {
        if(this.gameService.drawingPlayer != localStorage.getItem('username') && this.isInGame) return;
        this.drawingService.gridCanvas.style.cursor = 'default';
        this.pencilService.onMouseLeave();
    }

    @HostListener('mouseenter', ['$event'])
    onMouseEnter(event: MouseEvent): void {
        if(this.gameService.drawingPlayer != localStorage.getItem('username') && this.isInGame) return;
        this.drawingService.gridCanvas.style.cursor = 'crosshair';
        this.pencilService.onMouseEnter(event);
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }
}
