import { IncomingMessage } from '@app/classes/incomingMessage';
import { injectable } from 'inversify';
import * as socketio from "socket.io";


@injectable()
export class LobbyManagerService {

    constructor() {
    }

    create(){
        console.log("created lobby");
    }
}