import { Personnality } from '@app/ressources/variables/virtual-player-variables';
import { vPlayerText } from '@app/ressources/variables/vplayer-messages';
import { injectable } from 'inversify';
import { VirtualPlayer } from './virtual-player';

@injectable()
export class VirtualPlayerPassiveAgressive extends VirtualPlayer {
    
    constructor(gameId: string, gameType: number) {
        super(gameId, gameType);
        this.personnality = Personnality.PASSIVE_AGRESSIVE
        this.username = "Kevin";
        this.avatar = 8;     
    }

    sayHello(){
        let str = vPlayerText.passiveAgressive.meet.split("##");
        let message = str[0] + this.teammates + str[1];
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    sayHelloMany(){
        let str = vPlayerText.passiveAgressive.meetMany.split("##");
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
        let message = vPlayerText.passiveAgressive.rightGuess;
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    sayWrongGuess(){
        let str = vPlayerText.passiveAgressive.wrongGuess.split("##");
        let message = str[0] + this.teammates + str[1];
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    sayWrongTry(){
        let message = vPlayerText.passiveAgressive.wrongTry;
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    sayWeWon(){
        let str = vPlayerText.passiveAgressive.weWon.split("##");
        let message = str[0] + this.teammates + str[1];
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    sayWeLost(){
        let message = vPlayerText.passiveAgressive.weLost;
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    sayWeTied(){
        let message = vPlayerText.passiveAgressive.weTied;
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }

    sayEndSprintGame(){
        let message = vPlayerText.passiveAgressive.endSprintGame;
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timestamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }
}