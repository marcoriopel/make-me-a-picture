import { Lobby } from '@app/classes/lobby/lobby';
import { BasicUser, Player } from '@app/ressources/interfaces/user.interface';
import { SocketService } from '@app/services/sockets/socket.service';
import { injectable } from 'inversify';
import { Observable, BehaviorSubject } from 'rxjs';


@injectable()
export abstract class Game {
    protected difficulty: number;
    protected gameName: string;
    protected gameType: number;
    protected id: string;
    protected socketService: SocketService;
    isGameEnded: boolean = false;
    gameEnded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(lobby: Lobby, socketService: SocketService) {
        this.socketService = socketService;
        this.difficulty = lobby.getDifficulty();
        this.gameName = lobby.getGameName();
        this.gameType = lobby.getGameType();
        this.id = lobby.getId();
    }

    startGame(): void { }

    guessDrawing(username: string, guess: string): void { }

    getGameName(): string {
        return this.gameName;
    }

    getGameType(): number {
        return this.gameType;
    }

    getDifficulty(): number {
        return this.difficulty;
    }

    getPlayers(): any {}

    requestHint(user: BasicUser): void { }

    disconnectGame(username: string){}

    getGameEnded(): Observable<boolean> {
        return this.gameEnded.asObservable();
    }
}