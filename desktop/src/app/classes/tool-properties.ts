import { StampAttributes } from '@app/classes/stamps';
import { StraightLine } from './line';
import { Vec2 } from './vec2';

export interface Pencil {
    type: string;
    path: Vec2[];
    lineWidth: number;
    primaryColor: string;
}

export interface Brush {
    type: string;
    path: Vec2[];
    lineWidth: number;
    lineCap: string;
    pattern: string;
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

export interface Rectangle {
    type: string;
    primaryColor: string;
    secondaryColor: string;
    width: number;
    height: number;
    topLeftPoint: Vec2;
    fillStyle: number;
    isShiftDown: boolean;
    lineWidth: number;
}

export interface Ellipse {
    lastPoint: Vec2;
    firstPoint: Vec2;
    type: string;
    primaryColor: string;
    secondaryColor: string;
    fillStyle: number;
    isShiftDown: boolean;
    center: Vec2;
    radius: Vec2;
    lineWidth: number;
}

export interface Line {
    type: string;
    primaryColor: string;
    secondaryColor: string;
    mouseClicks: Vec2[];
    isDot: boolean;
    lineCap: string;
    lineWidth: number;
    line: StraightLine;
    storedLines: StraightLine[];
    isShiftDoubleClick: boolean;
    hasLastPointBeenChaged: boolean;
    dotWidth: number;
}

export interface Polygone {
    type: string;
    primaryColor: string;
    secondaryColor: string;
    fillStyle: number;
    lineWidth: number;
    circleHeight: number;
    circleWidth: number;
    firstPoint: Vec2;
    lastPoint: Vec2;
    sides: number;
}

export interface Resize {
    type: string;
    canvasSize: Vec2;
    imageData: ImageData;
}

export interface Fill {
    type: string;
    imageData: ImageData;
}

export interface Selection {
    type: string;
    imageData: ImageData;
}

export interface Stamp {
    type: string;
    color: string;
    opacity: number;
    size: number;
    position: Vec2;
    stamp: StampAttributes;
    angle: number;
}
