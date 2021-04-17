import { Vec2 } from './vec2';
    import { Difficulty } from './game';

export interface Drawing {
    difficulty: Difficulty,
    pencilStrokes: Stroke[],
    eraserStrokes: Stroke[],
    hints: string[],
    drawingName: string,
}

export interface Stroke {
    path: Vec2[],
    strokeNumber: number,
    isEraser: boolean,
    lineWidth: number,
    lineColor: string,
    lineOpacity: number,
}