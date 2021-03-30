import { Personnality } from '@app/ressources/variables/virtual-player-variables';
import { vPlayerText } from '@app/ressources/variables/vplayer-messages';
import { injectable } from 'inversify';
import { VirtualPlayer } from './virtual-player';

@injectable()
export class VirtualPlayerCompetitive extends VirtualPlayer {
    
    constructor(gameId: string) {
        super(gameId);
        this.personnality = Personnality.COMPETITIVE;
        this.username = "Émilio";
        this.avatar = 9;
    }

    sayHello(){
        let message = vPlayerText.competitive.meet;
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timeStamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }
}