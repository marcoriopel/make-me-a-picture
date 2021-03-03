import { Vec2 } from './vec2';

export enum Difficulty {
    Facile = 3,
    Normale = 2,
    Difficile = 1,
}

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