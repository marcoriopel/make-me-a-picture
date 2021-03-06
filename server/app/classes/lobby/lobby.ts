import { BasicUser } from '@app/ressources/interfaces/user.interface';
import { injectable } from 'inversify';

@injectable()
export abstract class Lobby {
    protected difficulty: number;
    protected gameName: string;
    protected gameType: number;

    constructor(difficulty: number, gameName: string) {
        this.difficulty = difficulty;
        this.gameName = gameName;
    }

    startGame(): void { }

    deleteLobby(): void { }

    addPlayer(user: BasicUser, socketId: string): void {}

    getPlayers(): any{} 

    removePlayer(): void{}

    getGameName():string{
        return this.gameName;
    }

    getGameType():number{
        return this.gameType;
    }

    getDifficulty():number{
        return this.difficulty;
    }
}