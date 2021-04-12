export interface Drawing {
    drawingId: string;
    eraserStrokes: Stroke[];
    pencilStrokes: Stroke[];
    drawingVotes: number;
    difficulty: number;
    hints: string[];
    drawingName: string;
}

export interface Stroke {
    path: Vec2[],
    lineWidth: number,
    lineColor: string,
    strokeNumber: number,
}

export interface Vec2 {
    x: number;
    y: number;
}