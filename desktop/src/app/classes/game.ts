export enum GameType {
    Classic,
    Sprint
}

export interface Game {
    id: string;
    name: string;
    type: GameType;
    player: string[];
    team1: string[];
    team2: string[]
}