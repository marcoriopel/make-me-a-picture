import { BasicUser, Player } from '@app/ressources/interfaces/user.interface';
import { injectable } from 'inversify';

@injectable()
export abstract class Game {
    protected difficulty: number;
    protected gameName: string;
    protected players: Player[];
    protected gameType: number;

    constructor(difficulty: number, gameName: string, players: Player[]) {
        this.difficulty = difficulty;
        this.gameName = gameName;
        this.players = players;
    }

    startGame(): void { }

    getGameName(): string {
        return this.gameName;
    }

    getGameType(): number {
        return this.gameType;
    }

    getDifficulty(): number {
        return this.difficulty;
    }
}