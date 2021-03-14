export interface Drawing {
    drawingId: string;
    strokes: Stroke[];
    drawingVotes: number;
    difficulty: number;
    hints: string[];
    drawingName: string;
}

export interface Stroke {
    path: Vec2[],
    lineWidth: number,
    lineColor: string,
}

export interface Vec2 {
    x: number;
    y: number;
}