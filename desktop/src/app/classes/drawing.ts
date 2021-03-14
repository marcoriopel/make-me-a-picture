import { Vec2 } from './vec2';
import { Difficulty } from './game';

export interface Drawing {
    difficulty: Difficulty,
    strokes: Stroke[],
    hints: string[],
    drawingName: string,
}

export interface Stroke {
    path: Vec2[],
    lineWidth: number,
    lineColor: string,
}