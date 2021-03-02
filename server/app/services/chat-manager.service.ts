import { IncomingMessage } from '@app/ressources/interfaces/incoming-message.interface';
import { injectable } from 'inversify';
import * as socketio from "socket.io";


@injectable()
export class ChatManagerService {

    static socket: socketio.Server;

    constructor() {
    }

    setSocket(io : socketio.Server){
        ChatManagerService.socket = io;
    }

    dispatchMessage( user: any, message: IncomingMessage){
        let date: Date = new Date();
        let tmpHour: number = date.getHours() + (date.getTimezoneOffset() / 60) - 5;
        if (tmpHour < 0) { tmpHour += 24 }
        let hours: string = tmpHour.toString().length == 1 ? "0" + tmpHour.toString() : tmpHour.toString();
        let minutes: string = date.getMinutes().toString().length == 1 ? "0" + date.getMinutes().toString() : date.getMinutes().toString();
        let seconds: string = date.getSeconds().toString().length == 1 ? "0" + date.getSeconds().toString() : date.getSeconds().toString();
        let timeStamp: string = hours + ":" + minutes + ":" + seconds;
        ChatManagerService.socket.emit('message', {"user": user, "text": message.text, "timeStamp": timeStamp, "textColor": "#000000" });
    }
}