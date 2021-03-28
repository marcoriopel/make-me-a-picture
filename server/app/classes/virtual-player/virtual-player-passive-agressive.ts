import { Personnality } from '@app/ressources/variables/virtual-player-variables';
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
}