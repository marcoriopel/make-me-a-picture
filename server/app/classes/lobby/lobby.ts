import { injectable } from 'inversify';

@injectable()
export abstract class Lobby {
    difficulty: number;
    gameName: string;
    gameType: number;
    players: string[];

    constructor(difficulty: number, gameName: string) {
        this.difficulty = difficulty;
        this.gameName = gameName;
     }

    startGame(): void{}

    deleteLobby(): void{}

    addPlayer(username: string): void {
        this.players.push(username)
    }

    removePlayer(): void{}
}