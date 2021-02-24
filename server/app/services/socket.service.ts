import { UserCredentialsModel } from '@app/models/user-credentials.model';
import { UserLogsModel } from '@app/models/user-logs.model';
import { TYPES } from '@app/types';
import { inject, injectable } from 'inversify';
import * as socketio from "socket.io";
import * as jwt from 'jsonwebtoken';
import * as http from 'http';
import { ChatManagerService } from './chat-manager.service';
import { IncomingMessage } from '@app/classes/incomingMessage';

@injectable()
export class SocketService {

    private io : socketio.Server;

    constructor(
        @inject(TYPES.ChatManagerService) private chatManagerService: ChatManagerService,
    ) {
    }
    
    init(server: http.Server): void {
        this.io = new socketio.Server(server, ({ cors: { origin: "*" } }));

        this.io.on("connection", (socket: socketio.Socket) => {

            socket.on('message', (message: IncomingMessage) => {
                try {
                    const user: string = jwt.verify(message.token, process.env.ACCES_TOKEN_SECRET) as string;
                    this.chatManagerService.dispatchMessage(this.io, user, message);
                } catch (err) {
                    // err
                }
            });
        });
    }

}
