import { MAX_BORDER, MAX_TOOL_WIDTH, MIN_BORDER, MIN_TOOL_WIDTH } from '@app/ressources/global-variables/global-variables';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Vec2 } from './vec2';

// disabling ts lint because methods have to be empty since they are implemented in the inhereting classes (polymorphism)
// tslint:disable:no-empty
export abstract class Tool {
    mouseDownCoord: Vec2;
    mouseDown: boolean = false;
    name: string;
    maxToolWidth: number = MAX_TOOL_WIDTH;
    minToolWidth: number = MIN_TOOL_WIDTH;
    maxBorderWidth: number = MAX_BORDER;
    minBorderWidth: number = MIN_BORDER;

    constructor(protected drawingService: DrawingService) {}

    onMouseDown(event: MouseEvent): void {}

    onMouseUp(event: MouseEvent): void {}

    onMouseMove(event: MouseEvent): void {}

    onMouseLeave(): void {}

    onMouseEnter(event: MouseEvent): void {}

    onKeyDown(event: KeyboardEvent): void {}

    onKeyPress(event: KeyboardEvent): void {}

    onKeyUp(event: KeyboardEvent): void {}

    onWheelEvent(event: WheelEvent): void {}

    getPositionFromMouse(event: MouseEvent): Vec2 {
        return { x: event.offsetX, y: event.offsetY };
    }

    setCursor(): void {
        this.drawingService.gridCanvas.style.cursor = 'crosshair';
    }

    reset(): void {}

    initialize(): void {}
}
