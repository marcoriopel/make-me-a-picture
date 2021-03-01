export enum GameType {
    Classic,
    SprintSolo,
    SprintCoop
}

export enum Difficulty {
    Easy,
    Normal,
    Hard
}

export interface NewGame {
    gameType: GameType,
    gameName: string,
    difficulty: Difficulty
}
export interface Game {
    id: string;
    name: string;
    type: GameType;
    player: string[];
    team1: string[];
    team2: string[]
}