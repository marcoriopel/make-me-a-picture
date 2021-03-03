import { UserCredentialsModel } from '@app/models/user-credentials.model';
import { UserLogsModel } from '@app/models/user-logs.model';
import { TYPES } from '@app/types';
import { inject, injectable } from 'inversify';
import * as socketio from "socket.io";
import * as jwt from 'jsonwebtoken';
import * as http from 'http';
import { ChatManagerService } from './chat-manager.service';
import { IncomingMessage } from '@app/ressources/interfaces/incoming-message.interface';
import { LobbyManagerService } from './lobby-manager.service';
import { TokenService } from './token.service';

@injectable()
export class SocketService {

    private io: socketio.Server;

    constructor(
        @inject(TYPES.ChatManagerService) private chatManagerService: ChatManagerService,
        @inject(TYPES.LobbyManagerService) private lobbyManagerService: LobbyManagerService,
        @inject(TYPES.TokenService) private tokenService: TokenService,
    ) {
        this.tokenService = TokenService.getInstance();
    }

    init(server: http.Server): void {
        this.io = new socketio.Server(server, ({ cors: { origin: "*" } }));
        this.distibuteSocket();

        this.io.on("connection", (socket: socketio.Socket) => {
            socket.on('message', (message: IncomingMessage) => {
                if (!(message instanceof Object)) {
                    message = JSON.parse(message)
                }
                try {
                    let date: Date = new Date();
                    const user: any = this.tokenService.getTokenInfo(message.token);
                    this.chatManagerService.addMessageToDB(user, message, date);
                    this.chatManagerService.dispatchMessage(user, message, date);
                } catch (err) {
                    // err
                }
            });

            socket.on('listenLobby', (request: any) => {
                if (!(request instanceof Object)) {
                    request = JSON.parse(request)
                }
                try {
                    socket.leave(request.oldLobbyId);
                    if(this.lobbyManagerService.lobbyExist(request.lobbyId)){
                        socket.join(request.lobbyId);
                        this.lobbyManagerService.dispatchTeams(request.lobbyId)
                    }
                    else
                        throw new Error("this lobby does not exist")
                } catch (err) {
                    this.io.emit('error', {"error": err.message});
                }
            });
        });
    }

    private distibuteSocket(): void {
        this.chatManagerService.setSocket(this.io);
        this.lobbyManagerService.setSocket(this.io);
    }

}
