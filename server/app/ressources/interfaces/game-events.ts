export interface DrawingEvent {
    eventType: number;
    event: Object;
    gameId: string;
}

export interface MouseDown {
    lineColor: string;
    lineWidth: number;
    coords: Vec2;
    strokeNumber: number;
}

export interface Vec2 {
    x: number;
    y: number;
}
