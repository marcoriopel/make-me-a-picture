import { UserCredentialsModel } from '@app/models/user-credentials.model';
import { UserLogsModel } from '@app/models/user-logs.model';
import { TYPES } from '@app/types';
import { inject, injectable } from 'inversify';
import * as socketio from "socket.io";
import * as jwt from 'jsonwebtoken';
import * as http from 'http';
import { IncomingMessage } from '@app/ressources/interfaces/incoming-message.interface';
import { TokenService } from '../token.service';

@injectable()
export class SocketService {

    private static instance: SocketService;
    private static io: socketio.Server;

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }
    
    constructor(){}

    init(server: http.Server){
        SocketService.io = new socketio.Server(server, ({ cors: { origin: "*" } }));
    }
    
    getSocket(): socketio.Server{
        return SocketService.io;
    }
}