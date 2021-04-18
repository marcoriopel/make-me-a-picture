export enum GameType {
    Classic,
    SprintSolo,
    SprintCoop
}

export enum Difficulty {
    EASY = 0,
    MEDIUM = 1,
    HARD = 2
}

export enum GuessTime {
    EASY = 60,
    MEDIUM = 45,
    HARD = 30
}

export interface NewGame {
    gameType: GameType,
    gameName: string,
    difficulty: Difficulty,
}

export interface AvailableGame {
    gameType: GameType,
    gameName: string,
    difficulty: Difficulty,
    id: string
}
export interface Game {
    id: string,
    name: string,
    type: GameType,
    difficulty: Difficulty,
    player: Player[],
    team1: Player[],
    team2: Player[]
}

export interface JoinLobby {
    lobbyId: string
}

export interface Player {
    username: string,
    avatar: number
}

export interface DrawingEvent {
    eventType: number;
    event: Object;
    gameId: string;
}

export interface MouseDown {
    lineColor: string;
    lineOpacity: number;
    lineWidth: number;
    coords: Vec2;
    strokeNumber: number;
}

export interface Vec2 {
    x: number;
    y: number;
}

export enum drawingEventType {
    MOUSEDOWN = 0,
    MOUSEMOVE = 1,
    MOUSEUP = 2,
    UNDO = 3,
    REDO = 4,
}