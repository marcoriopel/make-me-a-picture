import { injectable } from 'inversify';
import { Lobby } from './lobby';

@injectable()
export class ClassicLobby extends Lobby {
    
    constructor(difficulty: number, gameName: string) {
        super(difficulty, gameName);
    }

    startGame(): void{}

    deleteLobby(): void{}

    addPlayer(): void{}

    removePlayer(): void{}
}