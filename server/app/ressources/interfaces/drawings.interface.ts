export interface Drawing {
    drawingId: string;
    strokes: Object[];
    drawingVotes: number;
    difficulty: number;
    hints: string[];
    drawingName: string;
}