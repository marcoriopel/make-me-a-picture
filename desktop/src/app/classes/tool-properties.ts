import { Vec2 } from './vec2';

export interface Pencil {
    path: Vec2[];
    lineWidth: number;
    lineColor: string;
}

export interface Eraser {
    type: string;
    path: Vec2[];
    lineWidth: number;
    lineCap: string;
    fillStyle: string;
    primaryColor: string;
}