import { IncomingMessage } from '@app/ressources/interfaces/incoming-message';
import { injectable } from 'inversify';
import * as socketio from "socket.io";


@injectable()
export class GameManagerService {

    constructor() {
    }

    create(){
        console.log("created game");
    }
}