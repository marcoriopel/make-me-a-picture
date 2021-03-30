import { Personnality } from '@app/ressources/variables/virtual-player-variables';
import { vPlayerText } from '@app/ressources/variables/vplayer-messages';
import { injectable } from 'inversify';
import { VirtualPlayer } from './virtual-player';

@injectable()
export class VirtualPlayerPassiveAgressive extends VirtualPlayer {
    
    constructor(gameId: string) {
        super(gameId);
        this.personnality = Personnality.PASSIVE_AGRESSIVE
        this.username = "Kevin";
        this.avatar = 8;     
    }

    sayHello(){
        let message = vPlayerText.passiveAgressive.meet;
        const timestamp = new Date().getTime();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": { username: this.username }, "text": message, "timeStamp": timestamp, "textColor": "#000000", chatId: this.gameId });
    }
}