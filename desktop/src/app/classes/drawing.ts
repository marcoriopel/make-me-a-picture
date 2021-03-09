import { Vec2 } from './vec2';

export enum Difficulty {
    easy = 3,
    normal = 2,
    hard = 1,
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