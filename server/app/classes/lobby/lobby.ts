import { BasicUser } from '@app/ressources/interfaces/user.interface';
import { injectable } from 'inversify';

@injectable()
export abstract class Lobby {
    difficulty: number;
    gameName: string;
    gameType: number;
    players: BasicUser[];

    constructor(difficulty: number, gameName: string) {
        this.difficulty = difficulty;
        this.gameName = gameName;
     }

    startGame(): void{}

    deleteLobby(): void{}

    addPlayer(user: BasicUser): void {}

    getPlayers(): any{} 

    removePlayer(): void{}
}