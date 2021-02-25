import { UserCredentialsModel } from '@app/models/user-credentials.model';
import { UserLogsModel } from '@app/models/user-logs.model';
import { TYPES } from '@app/types';
import { inject, injectable } from 'inversify';
import * as socketio from "socket.io";
import * as jwt from 'jsonwebtoken';
import * as http from 'http';
import { ChatManagerService } from './chat-manager.service';
import { IncomingMessage } from '@app/ressources/interfaces/incoming-message';
import { LobbyManagerService } from './lobby-manager.service';

@injectable()
export class SocketService {

    private io : socketio.Server;

    constructor(
        @inject(TYPES.ChatManagerService) private chatManagerService: ChatManagerService,
        @inject(TYPES.LobbyManagerService) private lobbyManagerService: LobbyManagerService,
    ) {
    }
    
    init(server: http.Server): void {
        this.io = new socketio.Server(server, ({ cors: { origin: "*" } }));
        this.distibuteSocket();

        this.io.on("connection", (socket: socketio.Socket) => {

            socket.on('message', (message: IncomingMessage) => {
                try {
                    const user: string = jwt.verify(message.token, process.env.ACCES_TOKEN_SECRET) as string;
                    this.chatManagerService.dispatchMessage( user, message);
                } catch (err) {
                    // err
                }
            });
        });
    }

    private distibuteSocket(): void{
        this.chatManagerService.setSocket(this.io);
        this.lobbyManagerService.setSocket(this.io);
    }

}
