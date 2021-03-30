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
        let message = vPlayerText.anxious.meet;
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timeStamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }
}