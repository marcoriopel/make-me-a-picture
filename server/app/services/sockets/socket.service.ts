import { injectable } from 'inversify';
import * as socketio from "socket.io";
import * as http from 'http';

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