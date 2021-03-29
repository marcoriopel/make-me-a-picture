import { Personnality } from '@app/ressources/variables/virtual-player-variables';
import { injectable } from 'inversify';
import { VirtualPlayer } from './virtual-player';

@injectable()
export class VirtualPlayerNice extends VirtualPlayer {
    
    constructor(gameId: string) {
        super(gameId);
        this.personnality = Personnality.NICE;
        this.username = "Bernard";
        this.avatar = 6;
    }
}