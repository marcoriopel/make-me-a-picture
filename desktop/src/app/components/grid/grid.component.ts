import { Component, ElementRef, ViewChild } from '@angular/core';
import {
    DEFAULT_GRID_OPACITY,
    DEFAULT_GRID_SIZE,
    GRID_STEP,
    MAX_GRID_OPACITY,
    MAX_GRID_SQUARE_SIZE,
    MIN_GRID_OPACITY,
    MIN_GRID_SQUARE_SIZE,
    POLY_RED,
    TWO_DECIMAL_MULTIPLIER,
    WHITE,
} from '@app/ressources/global-variables/global-variables';
import { GRID_DECREASE_NAME, GRID_INCREASE_NAME, GRID_NAME } from '@app/ressources/global-variables/grid-elements';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { HotkeyService } from '@app/services/hotkey/hotkey.service';
@Component({
    selector: 'app-grid',
    templateUrl: './grid.component.html',
    styleUrls: ['./grid.component.scss'],
})
export class GridComponent {
    @ViewChild('grid', { static: false }) gridRef: ElementRef<HTMLButtonElement>;

  
    isEnabled: boolean = false;
    minSquareSize: number = MIN_GRID_SQUARE_SIZE;
    maxSquareSize: number = MAX_GRID_SQUARE_SIZE;
    minOpacity: number = MIN_GRID_OPACITY;
    maxOpacity: number = MAX_GRID_OPACITY;
    currentSquareSize: number = DEFAULT_GRID_SIZE;
    currentOpacity: number = DEFAULT_GRID_OPACITY;

    constructor(
        public drawingService: DrawingService,
        public hotkeyService: HotkeyService,
    ) {
        this.drawingService.gridSpacing = this.currentSquareSize;
        this.drawingService.opacity = this.currentOpacity / 100;
        this.hotkeyService.getKey().subscribe((toolName) => {
            switch (toolName) {
                case GRID_NAME: {
                    if (this.isEnabled) this.changeGridView();
                    else this.changeGridView();
                    break;
                }
                case GRID_INCREASE_NAME: {
                    if (this.currentSquareSize + GRID_STEP <= this.maxSquareSize) {
                        this.currentSquareSize += GRID_STEP;
                        this.changeGridSize(this.currentSquareSize);
                    }

                    break;
                }
                case GRID_DECREASE_NAME: {
                    if (this.currentSquareSize - GRID_STEP >= this.minSquareSize) {
                        this.currentSquareSize -= GRID_STEP;
                        this.changeGridSize(this.currentSquareSize);
                    }
                    break;
                }
            }
        });
    }

    changeGridView(): void {
        this.isEnabled = !this.isEnabled;
        this.drawingService.isGridEnabled = this.isEnabled;
        if (this.isEnabled){ 
            this.drawingService.setGrid();
            this.gridRef.nativeElement.style.backgroundColor = POLY_RED;
        }
        else {
            this.drawingService.clearCanvas(this.drawingService.gridCtx);
            this.gridRef.nativeElement.style.backgroundColor = WHITE;
        }
    }
    changeGridSize(newSize: number): void {
        newSize = Number(newSize);
        if (isNaN(newSize) || newSize < MIN_GRID_SQUARE_SIZE || newSize > MAX_GRID_SQUARE_SIZE || newSize.toString() === '') {
            alert('La taille des carrés doit être un nombre entre 5 et 200.');
        } else {
            this.drawingService.gridSpacing = newSize;
            this.currentSquareSize = newSize;
            if (this.isEnabled) {
                this.drawingService.setGrid();
            }
        }
    }

    changeOpacity(newOpacity: number): void {
        newOpacity = Number(newOpacity);
        newOpacity = Math.round((newOpacity + Number.EPSILON) * TWO_DECIMAL_MULTIPLIER) / TWO_DECIMAL_MULTIPLIER;

        if (isNaN(newOpacity) || newOpacity < MIN_GRID_OPACITY || newOpacity > MAX_GRID_OPACITY || newOpacity.toString() === '') {
            alert("L'opacité doit être un nombre entre 10 et 100.");
        } else {
            this.drawingService.opacity = newOpacity;
            this.currentOpacity = newOpacity;
            if (this.isEnabled) {
                this.drawingService.setGrid();
            }
        }
    }

    onFocus(): void {
        this.hotkeyService.isHotkeyEnabled = false;
    }

    onFocusOut(): void {
        this.hotkeyService.isHotkeyEnabled = true;
    }
}
