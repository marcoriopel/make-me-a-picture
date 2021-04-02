import { Personnality } from '@app/ressources/variables/virtual-player-variables';
import { vPlayerText } from '@app/ressources/variables/vplayer-messages';
import { injectable } from 'inversify';
import { VirtualPlayer } from './virtual-player';

@injectable()
export class VirtualPlayerAnxious extends VirtualPlayer {
    
    constructor(gameId: string) {
        super(gameId);
        this.personnality = Personnality.ANXIOUS;
        this.username = "Ginette";
        this.avatar = 7;
    }

    sayHello(){
        if(this.teammates.length > 1){
            this.sayHelloMany();
        }
        else{
            let str = vPlayerText.anxious.meet.split("##");
            let message = str[0] + this.teammates + str[1];
            const timestamp = new Date().getTime();
            this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
        }
    }

    sayHelloMany(){
        let str = vPlayerText.anxious.meetMany.split("##");
        let teamStr = "";
        for(let i=0; i < this.teammates.length; i++){
            if(i == this.teammates.length - 1){
                teamStr = teamStr.slice(0, teamStr.length - 2);
                teamStr += " et " + this.teammates[i]
            }
            else{
                teamStr += this.teammates[i] + ", "
            }
        }
        let message = str[0] + teamStr + str[1];
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    sayRightGuess(){
        let message = vPlayerText.anxious.rightGuess;
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    sayWrongGuess(){
        let message = vPlayerText.anxious.wrongGuess;
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    sayWrongTry(){
        let message = vPlayerText.anxious.wrongTry;
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    sayWeWon(){
        let str = vPlayerText.anxious.weWon.split("##");
        let message = str[0] + this.teammates + str[1];
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    sayWeLost(){
        let message = vPlayerText.anxious.weLost;
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timeStamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    sayWeTied(){
        let message = vPlayerText.anxious.weTied;
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timeStamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    sayEndSprintGame(){
        let message = vPlayerText.anxious.endSprintGame;
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }
}