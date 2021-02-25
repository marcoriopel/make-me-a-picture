import { IncomingMessage } from '@app/classes/incomingMessage';
import { injectable } from 'inversify';
import * as socketio from "socket.io";


@injectable()
export class ChatService {

    constructor() {
    }

    dispatchMessage(socket: socketio.Server, username: string, message: IncomingMessage){
        let date: Date = new Date();
        let tmpHour: number = date.getHours() + (date.getTimezoneOffset() / 60) - 5;
        if (tmpHour < 0) { tmpHour += 24 }
        let hours: string = tmpHour.toString().length == 1 ? "0" + tmpHour.toString() : tmpHour.toString();
        let minutes: string = date.getMinutes().toString().length == 1 ? "0" + date.getMinutes().toString() : date.getMinutes().toString();
        let seconds: string = date.getSeconds().toString().length == 1 ? "0" + date.getSeconds().toString() : date.getSeconds().toString();
        let timeStamp: string = hours + ":" + minutes + ":" + seconds;
        socket.emit('message', {"username": username, "avatar": message.avatar, "text": message.text, "timeStamp": timeStamp, "textColor": "#000000" });
    }
}