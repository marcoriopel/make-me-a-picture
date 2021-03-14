import { SocketService } from '@app/services/sockets/socket.service';
import { injectable } from 'inversify';
import { Lobby } from '../lobby/lobby';
import { Game } from './game';
import { Difficulty } from '@app/ressources/variables/game-variables'
import { SoloLobby } from '../lobby/solo-lobby';

@injectable()
export class SoloGame extends Game {
    private drawingTeam: number;
    private guessesLeft: number[] = [0, 0];

    constructor(lobby: SoloLobby, socketService: SocketService) {
        super(<Lobby>lobby, socketService);
        console.log("Started solo game with difficulty: " + this.difficulty + " and name: " + this.gameName);
    }

    private getOpposingTeam(): number {
        if (this.drawingTeam)
            return 0;
        else
            return 1;
    }

    setGuesses(): void {
        switch (this.difficulty) {
            case Difficulty.EASY:
                this.guessesLeft[this.drawingTeam] = 3;
                break;
            case Difficulty.MEDIUM:
                this.guessesLeft[this.drawingTeam] = 2;
                break;
            case Difficulty.HARD:
                this.guessesLeft[this.drawingTeam] = 1;
                break;
        }
        this.guessesLeft[this.getOpposingTeam()] = 0;
    }
}