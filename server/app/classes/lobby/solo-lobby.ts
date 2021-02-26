import { injectable } from 'inversify';
import { Lobby } from './lobby';

@injectable()
export class SoloLobby extends Lobby {
    
    constructor(difficulty: number, gameName: string) {
        super(difficulty, gameName);
        console.log("Created solo game lobby with difficulty: " + this.difficulty + " and name: " + this.gameName);
    }

    startGame(): void{}
}