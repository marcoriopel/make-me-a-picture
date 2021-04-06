import { BasicUser } from '@app/ressources/interfaces/user.interface';
import { injectable } from 'inversify';

@injectable()
export abstract class Lobby {
    protected difficulty: number;
    protected gameName: string;
    protected gameType: number;
    protected id: string;
    protected isPrivate: boolean;

    constructor(difficulty: number, gameName: string, id: string, isPrivate: boolean) {
        this.difficulty = difficulty;
        this.gameName = gameName;
        this.id = id;
        this.isPrivate = isPrivate;
    }

    startGame(): void { }

    deleteLobby(): void { }

    addPlayer(user: BasicUser, socketId: string): void { }

    getPlayers(): any { }

    removePlayer(user: BasicUser): void { }

    getGameName(): string {
        return this.gameName;
    }

    getGameType(): number {
        return this.gameType;
    }

    getDifficulty(): number {
        return this.difficulty;
    }

    getPrivacy(): boolean {
        return this.isPrivate;
    }

    getId(): string {
        return this.id;
    }
}