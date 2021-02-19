import { Vec2 } from './vec2';

export interface Pencil {
    type: string;
    path: Vec2[];
    lineWidth: number;
    primaryColor: string;
}

export interface Eraser {
    type: string;
    path: Vec2[];
    lineWidth: number;
    lineCap: string;
    fillStyle: string;
    primaryColor: string;
}