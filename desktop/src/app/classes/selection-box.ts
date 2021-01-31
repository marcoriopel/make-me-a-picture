import { Vec2 } from './vec2';

export interface SelectionBox {
    startingPoint: Vec2;
    width: number;
    height: number;
}

export interface SelectionObject {
    selectionBox: SelectionBox;
    selectionImage: HTMLCanvasElement;
}

export interface SelectionCorners {
    topRight: Corner;
    topLeft: Corner;
    bottomLeft: Corner;
    bottomRight: Corner;
}

export interface Corner {
    coordinates: Vec2;
    initialAngle: number;
    currentAngle: number;
}
