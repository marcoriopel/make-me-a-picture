import { injectable } from 'inversify';
import { Lobby } from './lobby';

@injectable()
export class CoopLobby extends Lobby {
    
    constructor(difficulty: number, gameName: string) {
        super(difficulty, gameName);
        console.log("Created coop game lobby with difficulty: " + this.difficulty + " and name: " + this.gameName);
    }

    startGame(): void{}

    deleteLobby(): void{}

    addPlayer(): void{}

    removePlayer(): void{}
}