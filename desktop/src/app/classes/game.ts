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
    player: string[],
    team1: string[],
    team2: string[]
}

export interface JoinLobby {
    lobbyId: string
}

export interface Player {
    username: string,
    avatar: number
}