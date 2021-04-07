import { BasicUser } from '@app/ressources/interfaces/user.interface';
import { NB_PERSONNALITIES, Personnality } from '@app/ressources/variables/virtual-player-variables';
import { injectable } from 'inversify';
import { VirtualPlayerAnxious } from '../virtual-player/virtual-player-anxious';
import { VirtualPlayerCompetitive } from '../virtual-player/virtual-player-competitive';
import { VirtualPlayerNice } from '../virtual-player/virtual-player-nice';
import { VirtualPlayerPassiveAgressive } from '../virtual-player/virtual-player-passive-agressive';

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

    generateRandomVPlayer(){
        const personnality = Math.floor(Math.random() * NB_PERSONNALITIES);
        switch (personnality){
            case Personnality.NICE:
                return new VirtualPlayerNice(this.id, this.gameType);
            case Personnality.ANXIOUS:
                return new VirtualPlayerAnxious(this.id, this.gameType);
            case Personnality.PASSIVE_AGRESSIVE:
                return new VirtualPlayerPassiveAgressive(this.id, this.gameType);
            case Personnality.COMPETITIVE:
                return new VirtualPlayerCompetitive(this.id, this.gameType);
        }
    }
}