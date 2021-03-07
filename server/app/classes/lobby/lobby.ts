import { BasicUser } from '@app/ressources/interfaces/user.interface';
import { injectable } from 'inversify';

@injectable()
export abstract class Lobby {
    protected difficulty: number;
    protected gameName: string;
    protected gameType: number;
    protected id: string;

    constructor(difficulty: number, gameName: string, id: string) {
        this.difficulty = difficulty;
        this.gameName = gameName;
        this.id = id;
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

    getId(): string{
        return this.id;
    }
}