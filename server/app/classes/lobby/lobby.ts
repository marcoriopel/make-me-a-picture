import { injectable } from 'inversify';

@injectable()
export abstract class Lobby {
    difficulty: number;
    gameName: string;
    players: string[];

    constructor(difficulty: number, gameName: string) {
        difficulty = difficulty;
        gameName = gameName;
     }

    startGame(): void{}

    deleteLobby(): void{}

    addPlayer(username: string): void {
        this.players.push(username)
    }

    removePlayer(): void{}
}