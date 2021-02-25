import { injectable } from 'inversify';
import { Lobby } from './lobby';

@injectable()
export class SoloLobby extends Lobby {
    
    constructor(difficulty: number, gameName: string) {
        super(difficulty, gameName);
    }

    startGame(): void{}
}